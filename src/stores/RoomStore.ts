import { RoomSocketService } from "@/service/RoomSocketService";
import { makeAutoObservable, observable, runInAction } from "mobx";
import { InvalidStateError } from "mediasoup-client/lib/errors";
import { MediaKind } from "mediasoup-client/lib/RtpParameters";
import { PomodoroTimerState } from "@/models/room/PomodoroTimerState";
import { PomodoroTimerEvent } from "@/models/room/PomodoroTimerEvent";

const MEDIA_CONSTRAINTS = {
  audio: true,
  video: {
    width: {
      min: 640,
      max: 1920,
    },
    height: {
      min: 400,
      max: 1080,
    },
  },
};

export enum RoomState {
  CREATED,
  CONNECTED,
  JOINED,
}

export interface RoomViewModel {
  onConnected: () => Promise<void>;
  onJoined: (
    timerStartedDate: string | undefined,
    timerState: PomodoroTimerState
  ) => void;
  onReceivedChat: (message: ChatMessage) => void;
  onAddedConsumer: (
    peerId: string,
    track: MediaStreamTrack,
    kind: MediaKind
  ) => void;
  onDisposedPeer: (disposedPeerId: string) => void;
  onPomodoroTimerEvent: (event: PomodoroTimerEvent) => void;
}

export interface ChatMessage {
  readonly id: string;
  readonly authorName: string;
  readonly content: string;
}

export class RoomStore implements RoomViewModel {
  private readonly _roomService = new RoomSocketService(this);

  private _state: RoomState = RoomState.CREATED;

  private _localVideoStream?: MediaStream = undefined;
  private _localAudioStream?: MediaStream = undefined;

  private readonly _remoteVideoStreamsByPeerId: Map<string, MediaStream> =
    observable.map(new Map());
  private readonly _remoteAudioStreamsByPeerId: Map<string, MediaStream> =
    observable.map(new Map());

  private _chatInput: string = "";
  private readonly _chatMessages: ChatMessage[] = observable.array([]);
  private _pomodoroTimerState: PomodoroTimerState = PomodoroTimerState.STOPPED;
  private _pomodoroTimerEventDate?: Date;

  constructor() {
    makeAutoObservable(this);
  }

  public get state(): RoomState {
    return this._state;
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

  public connectSocket = () => {
    this._roomService.connect();
  };

  public onConnected = async (): Promise<void> => {
    const mediaStream = await this.fetchLocalMedia({
      video: true,
      audio: true,
    });
    runInAction(() => {
      this._state = RoomState.CONNECTED;
      this._localVideoStream = new MediaStream([
        mediaStream.getVideoTracks()[0],
      ]);
      this._localAudioStream = new MediaStream([
        mediaStream.getAudioTracks()[0],
      ]);
    });
  };

  public joinRoom = (roomId: string) => {
    const mediaStream: MediaStream = new MediaStream();
    if (this._localVideoStream !== undefined) {
      mediaStream.addTrack(this._localVideoStream.getVideoTracks()[0]);
    }
    if (this._localAudioStream !== undefined) {
      mediaStream.addTrack(this._localAudioStream.getAudioTracks()[0]);
    }
    this._roomService.join(roomId, mediaStream);
  };

  public onJoined = (
    timerStartedDate: string | undefined,
    timerState: PomodoroTimerState
  ): void => {
    this._state = RoomState.JOINED;
    this._pomodoroTimerState = timerState;
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
    const media = await this.fetchLocalMedia({ video: true });
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
    const media = await this.fetchLocalMedia({ audio: true });
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

  private fetchLocalMedia = async ({
    video = false,
    audio = false,
  }): Promise<MediaStream> => {
    return await navigator.mediaDevices.getUserMedia({
      ...MEDIA_CONSTRAINTS,
      video: video,
      audio: audio,
    });
  };

  public onReceivedChat = (message: ChatMessage) => {
    this._chatMessages.push(message);
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
