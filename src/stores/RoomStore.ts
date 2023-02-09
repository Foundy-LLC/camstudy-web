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
import { auth } from "@/service/firebase";
import {
  OtherPeerExitedRoomEvent,
  OtherPeerJoinedRoomEvent,
  WaitingRoomEvent,
} from "@/models/room/WaitingRoomEvent";
import { RoomJoiner } from "@/models/room/RoomJoiner";
import {
  ALREADY_JOINED_ROOM_MESSAGE,
  CONNECTING_ROOM_MESSAGE,
  ROOM_IS_FULL_MESSAGE,
} from "@/constants/roomMessage";

export interface RoomViewModel {
  onConnected: () => Promise<void>;
  onConnectedWaitingRoom: (waitingRoomData: WaitingRoomData) => void;
  onWaitingRoomEvent: (event: WaitingRoomEvent) => void;
  onJoined: (
    timerStartedDate: string | undefined,
    timerState: PomodoroTimerState,
    timerProperty: PomodoroTimerProperty
  ) => void;
  onReceivedChat: (message: ChatMessage) => void;
  onAddedConsumer: (
    peerId: string,
    track: MediaStreamTrack,
    kind: MediaKind
  ) => void;
  onDisposedPeer: (disposedPeerId: string) => void;
  onPomodoroTimerEvent: (event: PomodoroTimerEvent) => void;
  onUpdatedPomodoroTimer: (newProperty: PomodoroTimerProperty) => void;
}

export class RoomStore implements RoomViewModel {
  private readonly _roomService = new RoomSocketService(this);

  private _failedToSigneIn: boolean = false;

  private _state: RoomState = RoomState.CREATED;

  private _localVideoStream?: MediaStream = undefined;
  private _localAudioStream?: MediaStream = undefined;

  private _waitingRoomData?: WaitingRoomData = undefined;

  private readonly _remoteVideoStreamsByPeerId: Map<string, MediaStream> =
    observable.map(new Map());
  private readonly _remoteAudioStreamsByPeerId: Map<string, MediaStream> =
    observable.map(new Map());

  private _chatInput: string = "";
  private readonly _chatMessages: ChatMessage[] = observable.array([]);
  private _pomodoroTimerState: PomodoroTimerState = PomodoroTimerState.STOPPED;
  private _pomodoroTimerEventDate?: Date = undefined;
  private _pomodoroProperty?: PomodoroTimerProperty = undefined;

  constructor(private _mediaUtil: MediaUtil = new MediaUtil()) {
    makeAutoObservable(this);
  }

  public get state(): RoomState {
    return this._state;
  }

  public get failedToSigneIn(): boolean {
    return this._failedToSigneIn;
  }

  public get localVideoStream(): MediaStream | undefined {
    return this._localVideoStream;
  }

  public get enabledLocalVideo(): boolean {
    return this._localVideoStream !== undefined;
  }

  public get enabledLocalAudio(): boolean {
    return this._localAudioStream !== undefined;
  }

  private _requireCurrentUserId(): string {
    if (auth.currentUser?.uid == null) {
      throw Error(
        "로그인 하지 않고 공부방 접속을 시도했습니다. 리다이렉트가 되어야 합니다."
      );
    }
    return auth.currentUser.uid;
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

  public get waitingRoomMessage(): string | undefined {
    const waitingRoomData = this._waitingRoomData;
    if (waitingRoomData === undefined) {
      return CONNECTING_ROOM_MESSAGE;
    }
    if (this._isCurrentUserMaster(waitingRoomData)) {
      return undefined;
    }
    if (this._isRoomFull(waitingRoomData)) {
      return ROOM_IS_FULL_MESSAGE;
    }
    if (this._isCurrentUserAlreadyJoined(waitingRoomData)) {
      return ALREADY_JOINED_ROOM_MESSAGE;
    }
    return undefined;
  }

  public get roomJoiners(): RoomJoiner[] {
    if (this._waitingRoomData === undefined) {
      return [];
    }
    return this._waitingRoomData.joinerList;
  }

  public get canJoinRoom(): boolean {
    const waitingRoomData = this._waitingRoomData;
    if (waitingRoomData === undefined) {
      return false;
    }
    if (this._isCurrentUserMaster(waitingRoomData)) {
      return true;
    }
    if (this._isCurrentUserAlreadyJoined(waitingRoomData)) {
      return false;
    }
    return !this._isRoomFull(waitingRoomData);
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
    const currentTime = new Date().getTime();
    const milliseconds = currentTime - this._pomodoroTimerEventDate.getTime();
    return milliseconds / 1000;
  }

  public get pomodoroTimerProperty(): PomodoroTimerProperty | undefined {
    return this._pomodoroProperty;
  }

  public connectSocket = (roomId: string) => {
    // 이미 로그인 되어있으면 곧바로 소켓에 연결
    if (auth.currentUser != null) {
      this._roomService.connect(roomId);
      return;
    }
    // 아니라면 연결 되고나서 소켓에 연결
    auth.onAuthStateChanged((state) => {
      if (state != null) {
        this._roomService.connect(roomId);
      } else {
        this._failedToSigneIn = true;
      }
    });
  };

  public onConnected = async (): Promise<void> => {
    const mediaStream = await this._mediaUtil.fetchLocalMedia({
      video: true,
      audio: true,
    });
    runInAction(() => {
      this._state = RoomState.CONNECTED;
      this._localVideoStream =
        this._mediaUtil.getMediaStreamUsingFirstVideoTrackOf(mediaStream);
      this._localAudioStream =
        this._mediaUtil.getMediaStreamUsingFirstAudioTrackOf(mediaStream);
    });
  };

  public onConnectedWaitingRoom = (waitingRoomData: WaitingRoomData) => {
    this._state = RoomState.WAITING_ROOM;
    this._waitingRoomData = waitingRoomData;
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
    this._roomService.join(mediaStream);
  };

  public onJoined = (
    timerStartedDate: string | undefined,
    timerState: PomodoroTimerState,
    timerProperty: PomodoroTimerProperty
  ): void => {
    this._state = RoomState.JOINED;
    this._pomodoroTimerState = timerState;
    this._pomodoroProperty = timerProperty;
    if (timerStartedDate !== undefined) {
      this._pomodoroTimerEventDate = new Date(timerStartedDate);
    }
  };

  public showVideo = async () => {
    if (this._localVideoStream !== undefined) {
      throw new InvalidStateError(
        "로컬 비디오가 있는 상태에서 비디오를 생성하려 했습니다."
      );
    }
    const media = await this._mediaUtil.fetchLocalMedia({ video: true });
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

  public unmuteAudio = async () => {
    if (this._localAudioStream !== undefined) {
      throw new InvalidStateError(
        "로컬 오디오가 있는 상태에서 오디오를 생성하려 했습니다."
      );
    }
    const media = await this._mediaUtil.fetchLocalMedia({ audio: true });
    await runInAction(async () => {
      const track = media.getAudioTracks()[0];
      this._localAudioStream = new MediaStream([track]);
      await this._roomService.produceAudioTrack(track);
    });
  };

  public muteAudio = () => {
    if (this._localAudioStream === undefined) {
      throw new InvalidStateError(
        "로컬 오디오가 없는 상태에서 오디오를 끄려 했습니다."
      );
    }
    this._roomService.closeAudioProducer();
    this._localAudioStream.getTracks().forEach((track) => track.stop());
    this._localAudioStream = undefined;
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
        break;
    }
  };

  public onPomodoroTimerEvent = (event: PomodoroTimerEvent) => {
    this._pomodoroTimerEventDate = new Date();
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

  public onDisposedPeer = (peerId: string): void => {
    this._remoteVideoStreamsByPeerId.delete(peerId);
    this._remoteAudioStreamsByPeerId.delete(peerId);
  };
}
