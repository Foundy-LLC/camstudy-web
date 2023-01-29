import {RoomSocketService} from "@/service/RoomSocketService";
import {makeAutoObservable} from "mobx";

const mediaConstraints = {
    audio: true,
    video: {
        width: {
            min: 640,
            max: 1920
        },
        height: {
            min: 400,
            max: 1080
        }
    }
};

export enum RoomState {
    CREATED,
    CONNECTED,
    JOINED,
}

export interface RoomObserver {
    onConnected: () => void;
    onJoined: () => void;
}

class RoomStore implements RoomObserver {

    private readonly _roomService = new RoomSocketService(this)

    private _localMediaStream?: MediaStream = undefined

    constructor() {
        makeAutoObservable(this)
    }

    public get localMediaStream(): MediaStream | undefined {
        return this._localMediaStream
    }

    public connectSocket = () => {
        this._roomService.connect()
    }

    private getLocalMedia = async () => {
        this._localMediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    }

    public onConnected(): void {
        this.getLocalMedia().then()
    }

    public onJoined(): void {
    }
}

const roomStore = new RoomStore()
export default roomStore