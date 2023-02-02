import { RoomStore } from "./RoomStore";

export class RootStore{
    roomStore;

    constructor(){
        this.roomStore = new RoomStore(this);
    }
}