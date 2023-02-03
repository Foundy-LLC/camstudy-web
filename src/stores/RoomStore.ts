import { RoomSocketService } from "@/service/RoomSocketService";
import { makeAutoObservable, observable, runInAction } from "mobx";
import { InvalidStateError } from "mediasoup-client/lib/errors";
import { MediaKind } from "mediasoup-client/lib/RtpParameters";

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
  onConnected: () => Promise<MediaStream>;
  onJoined: () => void;
  onReceivedChat: (message: ChatMessage) => void;
  onAddedConsumer: (
    peerId: string,
    track: MediaStreamTrack,
    kind: MediaKind
  ) => void;
  onDisposedPeer: (disposedPeerId: string) => void;
}

export interface ChatMessage {
  readonly id: string;
  readonly authorName: string;
  readonly content: string;
}

export class RoomStore implements RoomViewModel {
  private readonly _roomService = new RoomSocketService(this);

  private _localVideoStream?: MediaStream = undefined;
  private _localAudioStream?: MediaStream = undefined;

  private _remoteVideoStreamsByPeerId: Map<string, MediaStream> =
    observable.map(new Map());
  private _remoteAudioStreamsByPeerId: Map<string, MediaStream> =
    observable.map(new Map());

  private _chatInput: string = "";
  private _chatMessages: ChatMessage[] = observable.array([]);

  constructor() {
    makeAutoObservable(this);
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

  public get remoteVideoStreamsByPeerId(): Map<string, MediaStream> {
    return this._remoteVideoStreamsByPeerId;
  }

  public get remoteAudioStreamsByPeerId(): Map<string, MediaStream> {
    return this._remoteAudioStreamsByPeerId;
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

  public connectSocket = (roomId: string) => {
    this._roomService.connect(roomId);
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
      await this._roomService.produceTrack(track);
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
      await this._roomService.produceTrack(track);
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

  public onConnected = async (): Promise<MediaStream> => {
    const mediaStream = await this.fetchLocalMedia({
      video: true,
      audio: true,
    });
    runInAction(() => {
      this._localVideoStream = new MediaStream([
        mediaStream.getVideoTracks()[0],
      ]);
      this._localAudioStream = new MediaStream([
        mediaStream.getAudioTracks()[0],
      ]);
    });
    return mediaStream;
  };

  public onJoined = () => {
    // TODO
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

  public onDisposedPeer = (peerId: string): void => {
    this._remoteVideoStreamsByPeerId.delete(peerId);
    this._remoteAudioStreamsByPeerId.delete(peerId);
  };
}
