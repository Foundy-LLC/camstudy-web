import { RoomListStore } from "@/stores/RoomListStore";

export class RootStore {
  roomListStore;

  constructor() {
    this.roomListStore = new RoomListStore(this);
  }
}
