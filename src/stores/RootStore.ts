import { RoomListStore } from "@/stores/RoomListStore";
import { OrganizationStore } from "@/stores/OrganizationStore";
import { FriendStore } from "@/stores/FriendStore";
import { CropStore } from "@/stores/CropStore";
import { UserStore } from "@/stores/UserStore";
import { WelcomeStore } from "@/stores/WelcomeStore";
import { PagenationStore } from "@/stores/PagenationStore";

export class RootStore {
  userStore;
  welcomeStore;
  roomListStore;
  organizationStore;
  friendStore;
  cropStore;
  PagenationStore;
  constructor() {
    this.userStore = new UserStore(this);
    this.welcomeStore = new WelcomeStore(this);
    this.roomListStore = new RoomListStore(this);
    this.organizationStore = new OrganizationStore(this);
    this.friendStore = new FriendStore(this);
    this.cropStore = new CropStore(this);
    this.PagenationStore = new PagenationStore(this);
  }
}
