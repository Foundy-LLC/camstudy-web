import { RoomSocketService } from "@/service/RoomSocketService";
import { makeAutoObservable, observable } from "mobx";
import { InvalidStateError } from "mediasoup-client/lib/errors";

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
  onAddedConsumer: (peerId: string, track: MediaStreamTrack) => void;
  onDisposedPeer: (disposedPeerId: string) => void;
}

export class RoomStore implements RoomViewModel {
  private readonly _roomService = new RoomSocketService(this);

  private _localVideoStream?: MediaStream = undefined;
  private _localAudioStream?: MediaStream = undefined;

  private _remoteMediaStreamsByPeerId: Map<string, MediaStream> =
    observable.map(new Map());

  constructor() {
    makeAutoObservable(this);
  }

  public get localVideoStream(): MediaStream | undefined {
    return this._localVideoStream;
  }

  public get enabledVideo(): boolean {
    return this._localVideoStream !== undefined;
  }

  public get remoteMediaStreamsByPeerId(): Map<string, MediaStream> {
    return this._remoteMediaStreamsByPeerId;
  }

  public connectSocket = () => {
    this._roomService.connect();
  };

  public showVideo = async () => {
    if (this._localVideoStream !== undefined) {
      throw new InvalidStateError(
        "로컬 비디오가 있는 상태에서 비디오를 생성하려 했습니다."
      );
    }
    const media = await this.fetchLocalMedia({ video: true });
    const track = media.getVideoTracks()[0];
    this._localVideoStream = new MediaStream([track]);
    await this._roomService.produceTrack(track);
  };

  public hideVideo = () => {
    if (this._localVideoStream === undefined) {
      throw new InvalidStateError(
        "로컬 비디오가 없는 상태에서 비디오를 끄려 했습니다."
      );
    }
    this._roomService.closeVideoProducer();
    this._localVideoStream = undefined;
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
    this._localVideoStream = new MediaStream([mediaStream.getVideoTracks()[0]]);
    this._localAudioStream = new MediaStream([mediaStream.getAudioTracks()[0]]);
    return mediaStream;
  };

  public onJoined = () => {
    // TODO
  };

  public onAddedConsumer = (peerId: string, track: MediaStreamTrack) => {
    this._remoteMediaStreamsByPeerId.set(peerId, new MediaStream([track]));
  };

  public onDisposedPeer = (peerId: string): void => {
    this._remoteMediaStreamsByPeerId.delete(peerId);
  };
}
