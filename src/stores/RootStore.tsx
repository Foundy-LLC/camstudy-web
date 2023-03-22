import { RoomListStore } from "@/stores/RoomListStore";
import { OrganizationStore } from "@/stores/OrganizationStore";
import { FriendStore } from "@/stores/FriendStore";
import { CropStore } from "@/stores/CropStore";

export class RootStore {
  roomListStore;
  organizationStore;
  friendStore;
  cropStore;
  constructor() {
    this.roomListStore = new RoomListStore(this);
    this.organizationStore = new OrganizationStore(this);
    this.friendStore = new FriendStore(this);
    this.cropStore = new CropStore(this);
  }
}
