import { RoomSocketService } from "@/service/RoomSocketService";
import { makeAutoObservable, observable, runInAction } from "mobx";
import { InvalidStateError } from "mediasoup-client/lib/errors";
import { MediaKind } from "mediasoup-client/lib/RtpParameters";
import { PomodoroTimerState } from "@/models/room/PomodoroTimerState";
import { PomodoroTimerEvent } from "@/models/room/PomodoroTimerEvent";
import { beep } from "@/service/SoundPlayer";
import { PomodoroTimerProperty } from "@/models/room/PomodoroTimerProperty";
import { ChatMessage } from "@/models/room/ChatMessage";
import { RoomState } from "@/models/room/RoomState";
import { MediaUtil } from "@/utils/MediaUtil";
import { WaitingRoomData } from "@/models/room/WaitingRoomData";
import {
  OtherPeerExitedRoomEvent,
  OtherPeerJoinedRoomEvent,
  WaitingRoomEvent,
} from "@/models/room/WaitingRoomEvent";
import { RoomJoiner } from "@/models/room/RoomJoiner";
import {
  ALREADY_JOINED_ROOM_MESSAGE,
  BLACKLIST_CANNOT_JOIN_ROOM_MESSAGE,
  CONNECTING_ROOM_MESSAGE,
  ROOM_IS_FULL_MESSAGE,
} from "@/constants/roomMessage";
import { Auth } from "@firebase/auth";
import { PeerState } from "@/models/room/PeerState";
import { auth } from "@/service/firebase";
import { BlockedUser } from "@/models/room/BlockedUser";
import { convertToKoreaDate } from "@/utils/DateUtil";
import { UserStore } from "@/stores/UserStore";

export interface RoomViewModel {
  onConnectedWaitingRoom: (waitingRoomData: WaitingRoomData) => void;
  onNotExistsRoomId: () => void;
  onWaitingRoomEvent: (event: WaitingRoomEvent) => void;
  onFailedToJoin: (message: string) => void;
  onJoined: (
    peerStates: PeerState[],
    timerStartedDate: string | undefined,
    timerState: PomodoroTimerState,
    timerProperty: PomodoroTimerProperty
  ) => void;
  onChangePeerState: (state: PeerState) => void;
  onReceivedChat: (message: ChatMessage) => void;
  onAddedConsumer: (
    peerId: string,
    track: MediaStreamTrack,
    kind: MediaKind
  ) => void;
  onDisposedPeer: (disposedPeerId: string) => void;
  onPomodoroTimerEvent: (event: PomodoroTimerEvent) => void;
  onUpdatedPomodoroTimer: (newProperty: PomodoroTimerProperty) => void;
  onKicked: (userId: string) => void;
  onBlocked: (userId: string) => void;
  onCloseVideoConsumer: (userId: string) => void;
  onCloseAudioConsumer: (userId: string) => void;
}

export class RoomStore implements RoomViewModel {
  private readonly _roomService;

  private _failedToSignIn: boolean = false;

  private _state: RoomState = RoomState.CREATED;

  private _localVideoStream?: MediaStream = undefined;
  private _localAudioStream?: MediaStream = undefined;
  private _enabledHeadset: boolean = true;

  // ======================= 대기실 관련 =======================
  private _waitingRoomData?: WaitingRoomData = undefined;
  private _passwordInput: string = "";
  private _failedToJoinMessage?: string = undefined;
  // ========================================================

  private readonly _remoteVideoStreamsByPeerId: Map<string, MediaStream> =
    observable.map(new Map());
  private readonly _remoteVideoSwitchByPeerId: Map<string, boolean> =
    observable.map(new Map());
  private readonly _remoteAudioStreamsByPeerId: Map<string, MediaStream> =
    observable.map(new Map());

  private _masterId?: string = undefined;
  private _peerStates: PeerState[] = [];
  private _chatInput: string = "";
  private readonly _chatMessages: ChatMessage[] = observable.array([]);
  private _pomodoroTimerState: PomodoroTimerState = PomodoroTimerState.STOPPED;
  private _pomodoroTimerEventDate?: Date = undefined;
  private _pomodoroProperty?: PomodoroTimerProperty = undefined;
  private _blacklist: BlockedUser[] = [];
  private _kicked: boolean = false;
  private _videoDeviceList: MediaDeviceInfo[] = [];
  private _audioDeviceList: MediaDeviceInfo[] = [];
  private _speakerDeviceList: MediaDeviceInfo[] = [];
  private _currentVideoDeviceId: string | undefined = undefined;
  private _currentAudioDeviceId: string | undefined = undefined;
  private _currentSpeakerDeviceId: string | undefined = undefined;

  private _reRender = 0;

  constructor(
    userStore: UserStore,
    private _mediaUtil: MediaUtil = new MediaUtil(),
    private readonly _auth: Auth = auth,
    roomService?: RoomSocketService
  ) {
    makeAutoObservable(this);
    this._roomService = roomService ?? new RoomSocketService(this, userStore);
  }

  public onCloseVideoConsumer(userId: string) {
    this._reRender++;
  }

  public get reRender() {
    return this._reRender;
  }

  public onCloseAudioConsumer(userId: string) {}

  /**
   * 회원에게 알림을 보내기위한 메시지이다.
   */
  private _userMessage?: string = undefined;

  public get videoDeviceList() {
    return this._videoDeviceList;
  }

  public get audioDeviceList() {
    return this._audioDeviceList;
  }

  public get currentVideoDeviceId() {
    return this._currentVideoDeviceId;
  }

  public get currentAudioDeviceId() {
    return this._currentAudioDeviceId;
  }

  public get state(): RoomState {
    return this._state;
  }

  public get failedToSignIn(): boolean {
    return this._failedToSignIn;
  }

  public get localVideoStream(): MediaStream | undefined {
    return this._localVideoStream;
  }

  public get localAudioStream(): MediaStream | undefined {
    return this._localAudioStream;
  }

  public get enabledLocalVideo(): boolean {
    return this._localVideoStream !== undefined;
  }

  public get enabledLocalAudio(): boolean {
    return this._localAudioStream !== undefined;
  }

  public get enabledHeadset(): boolean {
    return this._enabledHeadset;
  }

  // ================================ 대기실 getter 시작 ================================
  private _requireCurrentUserId(): string {
    if (this._auth.currentUser?.uid == null) {
      throw Error(
        "로그인 하지 않고 공부방 접속을 시도했습니다. 리다이렉트가 되어야 합니다."
      );
    }
    return this._auth.currentUser.uid;
  }

  private _isCurrentUserMaster = (
    waitingRoomData: WaitingRoomData
  ): boolean => {
    return waitingRoomData.masterId === this._requireCurrentUserId();
  };

  private _isRoomFull = (waitingRoomData: WaitingRoomData): boolean => {
    return waitingRoomData.joinerList.length >= waitingRoomData.capacity;
  };

  private _isCurrentUserAlreadyJoined = (
    waitingRoomData: WaitingRoomData
  ): boolean => {
    const currentUserId = this._requireCurrentUserId();
    return waitingRoomData.joinerList.some(
      (joiner) => joiner.id === currentUserId
    );
  };

  private _isCurrentUserBlocked = (waitingRoomData: WaitingRoomData) => {
    const currentUserId = this._requireCurrentUserId();
    return waitingRoomData.blacklist.some((user) => user.id === currentUserId);
  };

  public setFailedToJoinMessage(message: string) {
    this._failedToJoinMessage = message;
  }

  public get failedToJoinMessage(): string | undefined {
    return this._failedToJoinMessage;
  }

  public get waitingRoomMessage(): string | undefined {
    if (this._failedToJoinMessage != null) {
      return this._failedToJoinMessage;
    }
    const waitingRoomData = this._waitingRoomData;
    if (waitingRoomData === undefined) {
      return undefined;
    }
    if (this._isCurrentUserAlreadyJoined(waitingRoomData)) {
      return ALREADY_JOINED_ROOM_MESSAGE;
    }
    // if (this._isCurrentUserMaster(waitingRoomData)) {
    //   return undefined;
    // }
    if (this._isRoomFull(waitingRoomData)) {
      return ROOM_IS_FULL_MESSAGE;
    }
    if (this._isCurrentUserBlocked(waitingRoomData)) {
      return BLACKLIST_CANNOT_JOIN_ROOM_MESSAGE;
    }
    return undefined;
  }

  public get hasPassword(): boolean {
    if (this._waitingRoomData === undefined) {
      return false;
    }
    return this._waitingRoomData.hasPassword;
  }

  public get roomJoiners(): RoomJoiner[] {
    if (this._waitingRoomData === undefined) {
      return [];
    }
    return this._waitingRoomData.joinerList;
  }

  public get passwordInput(): string {
    return this._passwordInput;
  }

  public updatePasswordInput = (password: string) => {
    this._passwordInput = password;
  };

  public get enableJoinButton(): boolean {
    const waitingRoomData = this._waitingRoomData;
    if (waitingRoomData === undefined) {
      return false;
    }
    if (waitingRoomData.hasPassword && this._passwordInput.length < 4) {
      return false;
    }
    if (this._isCurrentUserAlreadyJoined(waitingRoomData)) {
      return false;
    }
    // if (this._isCurrentUserMaster(waitingRoomData)) {
    //   return true;
    // }
    if (this._isCurrentUserBlocked(waitingRoomData)) {
      return false;
    }
    return !this._isRoomFull(waitingRoomData);
  }

  // ==============================================================================

  public get isCurrentUserMaster(): boolean {
    if (this._auth.currentUser?.uid === undefined) {
      return false;
    }
    return this._masterId === this._auth.currentUser?.uid;
  }

  public get userMasterId(): string | undefined {
    return this._masterId;
  }

  public get peerStates(): PeerState[] {
    return this._peerStates;
  }

  public get sortedPeerStates(): PeerState[] {
    if (this._auth.currentUser?.uid === undefined) {
      return this._peerStates;
    }
    const currentUid = this._auth.currentUser?.uid;
    const currentPeerState = this._peerStates.find((peerState) => {
      if (peerState.uid === currentUid) return peerState;
    });
    const otherPeerStates = this._peerStates.filter((peerState) => {
      return peerState.uid !== currentUid;
    });
    const sortedOtherPeerStates = otherPeerStates.sort(
      (a: PeerState, b: PeerState): number => {
        return a.name > b.name ? -1 : 1;
      }
    );
    return [currentPeerState!, ...sortedOtherPeerStates];
  }

  public get remoteVideoStreamByPeerIdEntries(): [string, MediaStream][] {
    return [...this._remoteVideoStreamsByPeerId.entries()];
  }

  public get remoteAudioStreamByPeerIdEntries(): [string, MediaStream][] {
    return [...this._remoteAudioStreamsByPeerId];
  }

  public get chatInput(): string {
    return this._chatInput;
  }

  public get chatMessages(): ChatMessage[] {
    return this._chatMessages;
  }

  public get enabledChatSendButton(): boolean {
    return this._chatInput.length > 0;
  }

  public get pomodoroTimerState(): PomodoroTimerState {
    return this._pomodoroTimerState;
  }

  public get pomodoroTimerElapsedSeconds(): number {
    if (this._pomodoroTimerEventDate === undefined) {
      return 0;
    }
    const currentTime = convertToKoreaDate(new Date()).getTime();
    const milliseconds = currentTime - this._pomodoroTimerEventDate.getTime();
    return milliseconds / 1000;
  }

  public get pomodoroTimerProperty(): PomodoroTimerProperty | undefined {
    return this._pomodoroProperty;
  }

  public get blacklist(): BlockedUser[] {
    return this._blacklist;
  }

  public get kicked(): boolean {
    return this._kicked;
  }

  public get userMessage(): string | undefined {
    return this._userMessage;
  }

  public connectSocket = async (roomId: string) => {
    // 이미 로그인 되어있으면 곧바로 소켓에 연결
    if (this._auth.currentUser != null) {
      const result = await this._roomService.connect(roomId);
      if (result.isFailure) {
        runInAction(() => {
          this._failedToJoinMessage = result.throwableOrNull()!.message;
        });
      }
      return;
    }
    // 아니라면 연결 되고나서 소켓에 연결
    const unsubscribe = this._auth.onAuthStateChanged(async (state) => {
      unsubscribe();
      if (state != null) {
        const result = await this._roomService.connect(roomId);
        if (result.isFailure) {
          runInAction(() => {
            this._failedToJoinMessage = result.throwableOrNull()!.message;
          });
        }
      } else {
        this._failedToSignIn = true;
      }
    });
  };

  public onConnectedWaitingRoom = async (waitingRoomData: WaitingRoomData) => {
    const mediaStream = await this._mediaUtil.fetchLocalMedia({
      video: true,
      audio: true,
    });
    runInAction(() => {
      this._localVideoStream =
        this._mediaUtil.getMediaStreamUsingFirstVideoTrackOf(mediaStream);
      this._state = RoomState.WAITING_ROOM;
      this._waitingRoomData = waitingRoomData;
      this._masterId = waitingRoomData.masterId;
      this._blacklist = waitingRoomData.blacklist;
    });
  };

  public onNotExistsRoomId = () => {
    this._state = RoomState.NOT_EXISTS;
  };

  public onWaitingRoomEvent = (event: WaitingRoomEvent) => {
    const waitingRoomData = this._waitingRoomData;
    if (waitingRoomData === undefined) {
      throw Error(
        "대기실 정보가 초기화되기 전에 대기실 이벤트를 수신했습니다."
      );
    }
    if (event instanceof OtherPeerJoinedRoomEvent) {
      this._waitingRoomData = {
        ...waitingRoomData,
        joinerList: [...waitingRoomData.joinerList, event.joiner],
      };
    } else if (event instanceof OtherPeerExitedRoomEvent) {
      this._waitingRoomData = {
        ...waitingRoomData,
        joinerList: waitingRoomData.joinerList.filter(
          (joiner) => joiner.id !== event.exitedUserId
        ),
      };
    } else {
      throw Error("지원되지 않는 event입니다.");
    }
  };

  public joinRoom = () => {
    const mediaStream: MediaStream = new MediaStream();
    if (this._localVideoStream !== undefined) {
      mediaStream.addTrack(this._localVideoStream.getVideoTracks()[0]);
    }
    if (this._localAudioStream !== undefined) {
      mediaStream.addTrack(this._localAudioStream.getAudioTracks()[0]);
    }
    this._roomService.join(mediaStream, this._passwordInput);
  };

  public onFailedToJoin = (message: string) => {
    this._failedToJoinMessage = message;
  };

  public onJoined = (
    peerStates: PeerState[],
    timerStartedDate: string | undefined,
    timerState: PomodoroTimerState,
    timerProperty: PomodoroTimerProperty
  ): void => {
    this._peerStates = peerStates;
    this._state = RoomState.JOINED;
    this._waitingRoomData = undefined;
    this._pomodoroTimerState = timerState;
    this._pomodoroProperty = timerProperty;
    if (timerStartedDate !== undefined) {
      this._pomodoroTimerEventDate = convertToKoreaDate(
        new Date(timerStartedDate)
      );
    }
  };

  public changeCamera = async (deviceId: string) => {
    const media = await this._mediaUtil.fetchLocalVideo(deviceId);
    await runInAction(async () => {
      this._localVideoStream = media;
      await this._roomService.replaceVideoProducer({
        track: this._localVideoStream.getTracks()[0],
      });
    });
  };

  public changeAudio = async (deviceId: string) => {
    const media = await this._mediaUtil.fetchLocalAudioInput(deviceId);
    await runInAction(async () => {
      this._localAudioStream = media;
      await this._roomService.replaceAudioProducer({
        track: this._localAudioStream.getTracks()[0],
      });
    });
  };

  public showVideo = async () => {
    if (this._localVideoStream !== undefined) {
      throw new InvalidStateError(
        "로컬 비디오가 있는 상태에서 비디오를 생성하려 했습니다."
      );
    }
    let media: MediaStream;
    if (this._currentVideoDeviceId == undefined) {
      media = await this._mediaUtil.fetchLocalMedia({
        video: true,
      });
    } else {
      media = await this._mediaUtil.fetchLocalVideo(this._currentVideoDeviceId);
    }
    await runInAction(async () => {
      const track = media.getVideoTracks()[0];
      this._localVideoStream = new MediaStream([track]);
      await this._roomService.produceVideoTrack(track);
    });
  };

  public hideVideo = () => {
    if (this._localVideoStream === undefined) {
      throw new InvalidStateError(
        "로컬 비디오가 없는 상태에서 비디오를 끄려 했습니다."
      );
    }
    this._roomService.closeVideoProducer();
    this._localVideoStream.getTracks().forEach((track) => track.stop());
    this._localVideoStream = undefined;
  };

  public unmuteMicrophone = async () => {
    if (this._localAudioStream !== undefined) {
      throw new InvalidStateError(
        "로컬 오디오가 있는 상태에서 오디오를 생성하려 했습니다."
      );
    }
    if (!this.enabledHeadset) {
      this.unmuteHeadset();
    }
    let media: MediaStream;
    if (this._currentAudioDeviceId == null) {
      media = await this._mediaUtil.fetchLocalMedia({ audio: true });
    } else {
      media = await this._mediaUtil.fetchLocalAudioInput(
        this._currentAudioDeviceId
      );
    }
    await runInAction(async () => {
      const track = media.getAudioTracks()[0];
      this._localAudioStream = new MediaStream([track]);
      await this._roomService.produceAudioTrack(track);
    });
  };

  public muteMicrophone = () => {
    if (this._localAudioStream === undefined) {
      throw new InvalidStateError(
        "로컬 오디오가 없는 상태에서 오디오를 끄려 했습니다."
      );
    }
    this._roomService.closeAudioProducer();
    this._localAudioStream.getTracks().forEach((track) => track.stop());
    this._localAudioStream = undefined;
  };

  public unmuteHeadset = () => {
    this._roomService.unmuteHeadset();
    this._enabledHeadset = true;
  };

  public muteHeadset = () => {
    if (this.enabledLocalAudio) {
      this.muteMicrophone();
    }
    for (const remoteAudioStream of this._remoteAudioStreamsByPeerId.values()) {
      remoteAudioStream.getAudioTracks().forEach((audio) => audio.stop());
    }
    // TODO(민성): 헤드셋 뮤트하고 _remoteAudioStreamsByPeerId 클리어 해야하는지 확인하기
    this._roomService.muteHeadset();
    this._enabledHeadset = false;
  };

  public hideRemoteVideo = (userId: string) => {
    const remoteVideoStream = this._remoteVideoStreamsByPeerId.get(userId);
    if (remoteVideoStream != null) {
      remoteVideoStream.getVideoTracks().forEach((video) => video.stop());
    }
    this._roomService.hideRemoteVideo(userId);
    this._remoteVideoSwitchByPeerId.set(userId, false);
  };

  public showRemoteVideo = (userId: string) => {
    this._roomService.showRemoteVideo(userId);
    this._remoteVideoSwitchByPeerId.set(userId, true);
  };

  public onChangePeerState = (state: PeerState) => {
    this._peerStates = this._peerStates.filter((s) => state.uid !== s.uid);
    this._peerStates.push(state);
  };

  public updateChatInput = (message: string) => {
    this._chatInput = message;
  };

  public sendChat = () => {
    this._roomService.sendChat(this._chatInput);
    this._chatInput = "";
  };

  public startTimer = () => {
    this._roomService.startTimer();
  };

  public updateAndStopPomodoroTimer = (newProperty: PomodoroTimerProperty) => {
    this._roomService.updateAndStopTimer(newProperty);
  };

  public onUpdatedPomodoroTimer = (newProperty: PomodoroTimerProperty) => {
    this._pomodoroTimerState = PomodoroTimerState.STOPPED;
    this._pomodoroTimerEventDate = undefined;
    this._pomodoroProperty = newProperty;
  };

  public onReceivedChat = (message: ChatMessage) => {
    this._chatMessages.push(message);
    beep();
  };

  public onAddedConsumer = (
    peerId: string,
    track: MediaStreamTrack,
    kind: MediaKind
  ) => {
    switch (kind) {
      case "audio":
        this._remoteAudioStreamsByPeerId.set(peerId, new MediaStream([track]));
        break;
      case "video":
        this._remoteVideoStreamsByPeerId.set(peerId, new MediaStream([track]));
        this._remoteVideoSwitchByPeerId.set(peerId, true);
        break;
    }
  };

  public onPomodoroTimerEvent = (event: PomodoroTimerEvent) => {
    this._pomodoroTimerEventDate = convertToKoreaDate(new Date());
    beep();
    switch (event) {
      case PomodoroTimerEvent.ON_START:
        this._pomodoroTimerState = PomodoroTimerState.STARTED;
        break;
      case PomodoroTimerEvent.ON_SHORT_BREAK:
        this._pomodoroTimerState = PomodoroTimerState.SHORT_BREAK;
        break;
      case PomodoroTimerEvent.ON_LONG_BREAK:
        this._pomodoroTimerState = PomodoroTimerState.LONG_BREAK;
        break;
    }
  };

  private getUserNameBy = (userId: string): string | undefined => {
    return this._peerStates.find((state) => state.uid === userId)?.name;
  };

  public requireUserNameBy = (userId: string): string => {
    const userName = this.getUserNameBy(userId);
    if (userName == null) {
      throw Error("해당 회원 이름을 찾을 수 없습니다.");
    }
    return userName;
  };

  public kickUser = (userId: string) => {
    this._roomService.kickUser(userId);
  };

  public blockUser = (userId: string) => {
    this._roomService.blockUser(userId);
  };

  public exitRoom = () => {
    this._localVideoStream?.getTracks().forEach((track) => {
      track.stop();
    });
    this._localAudioStream?.getTracks().forEach((track) => {
      track.stop();
    });
    this._roomService.exitRoom();
  };

  public unblockUser = async (userId: string) => {
    try {
      await this._roomService.unblockUser(userId);
      this._blacklist = this._blacklist.filter((user) => user.id !== userId);
    } catch (e) {
      this._userMessage =
        typeof e === "string" ? e : "회원 차단 해제를 실패했습니다.";
    }
  };

  public onKicked = (userId: string) => {
    const isMe = userId === this._auth.currentUser!!.uid;
    if (isMe) {
      this._kicked = true;
      this._localAudioStream?.getTracks().forEach((t) => t.stop());
      this._localVideoStream?.getTracks().forEach((t) => t.stop());
    } else {
      const kickedPeerState = this._peerStates.find(
        (peer) => peer.uid === userId
      );
      if (kickedPeerState == null) {
        throw Error("강퇴시킨 피어의 정보가 없습니다.");
      }
      this._userMessage = `${kickedPeerState.name}님이 강퇴되었습니다.`;
    }
  };

  public onBlocked = (userId: string) => {
    const blockedPeerState = this._peerStates.find(
      (peer) => peer.uid === userId
    );
    if (blockedPeerState == null) {
      throw Error("차단한 피어의 상태 정보가 없습니다.");
    }
    this._blacklist = [
      ...this._blacklist,
      { id: userId, name: blockedPeerState.name },
    ];
    this.onKicked(userId);
  };

  public clearUserMessage = () => {
    this._userMessage = undefined;
  };

  public onDisposedPeer = (peerId: string): void => {
    this._remoteVideoStreamsByPeerId.delete(peerId);
    this._remoteAudioStreamsByPeerId.delete(peerId);
    this._peerStates = this._peerStates.filter((peer) => peer.uid !== peerId);
  };

  public setVideoDeviceList = (videoDeviceList: MediaDeviceInfo[]) => {
    this._videoDeviceList = videoDeviceList;
  };
  public setAudioDeviceList = (audioDeviceList: MediaDeviceInfo[]) => {
    this._audioDeviceList = audioDeviceList;
  };

  public setCurrentVideoDeviceId = (id: string | undefined) => {
    this._currentVideoDeviceId = id;
  };
  public setCurrentAudioDeviceId = (id: string | undefined) => {
    this._currentAudioDeviceId = id;
  };
  public getEnableHideRemoteVideoByUserId = (userId: string) => {
    return this._remoteVideoSwitchByPeerId.get(userId);
  };
}
