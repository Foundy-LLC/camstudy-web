import { RoomSocketService } from "@/service/RoomSocketService";
import { makeAutoObservable, observable } from "mobx";

const mediaConstraints = {
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
  private _localMediaStream?: MediaStream = undefined;
  private _remoteMediaStreamsByPeerId: Map<string, MediaStream> =
    observable.map(new Map());

  constructor() {
    makeAutoObservable(this);
  }

  public get localMediaStream(): MediaStream | undefined {
    return this._localMediaStream;
  }

  public get remoteMediaStreamsByPeerId(): Map<string, MediaStream> {
    return this._remoteMediaStreamsByPeerId;
  }

  public connectSocket = () => {
    this._roomService.connect();
  };

  private fetchLocalMedia = async (): Promise<MediaStream> => {
    return await navigator.mediaDevices.getUserMedia(mediaConstraints);
  };

  public onConnected = async (): Promise<MediaStream> => {
    return (this._localMediaStream = await this.fetchLocalMedia());
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
