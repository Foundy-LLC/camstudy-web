import { RoomListStore } from "./RoomListStore";

export class RootStore {
  roomListStore;

  constructor() {
    this.roomListStore = new RoomListStore(this);
  }
}
