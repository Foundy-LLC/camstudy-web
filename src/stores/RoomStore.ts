import { RoomSocketService } from "@/service/RoomSocketService";
import { makeAutoObservable, observable } from "mobx";
import { Consumer } from "mediasoup-client/lib/Consumer";

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
  onAddedConsumer: (consumer: Consumer) => void;
}

export class RoomStore implements RoomViewModel {
  private readonly _roomService = new RoomSocketService(this);
  private _localMediaStream?: MediaStream = undefined;
  private _remoteMediaStreamsByProducerId: Map<string, MediaStream> =
    observable.map(new Map());

  constructor() {
    makeAutoObservable(this);
  }

  public get localMediaStream(): MediaStream | undefined {
    return this._localMediaStream;
  }

  public get remoteMediaStreamsByProducerId(): Map<string, MediaStream> {
    return this._remoteMediaStreamsByProducerId;
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

  public onAddedConsumer = (consumer: Consumer) => {
    this._remoteMediaStreamsByProducerId.set(
      consumer.producerId,
      new MediaStream([consumer.track])
    );
  };
}
