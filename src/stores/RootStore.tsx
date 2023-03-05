import { RoomListStore } from "@/stores/RoomListStore";
import { OrganizationStore } from "@/stores/OrganizationStore";
import { FriendStore } from "@/stores/FriendStore";

export class RootStore {
  roomListStore;
  organizationStore;
  friendStore;
  constructor() {
    this.roomListStore = new RoomListStore(this);
    this.organizationStore = new OrganizationStore(this);
    this.friendStore = new FriendStore(this);
  }
}
