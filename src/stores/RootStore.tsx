import { RoomListStore } from "@/stores/RoomListStore";
import { OrganizationStore } from "@/stores/OrganizationStore";

export class RootStore {
  roomListStore;
  organizationStore;
  constructor() {
    this.roomListStore = new RoomListStore(this);
    this.organizationStore = new OrganizationStore(this);
  }
}
