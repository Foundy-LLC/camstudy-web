import { makeAutoObservable, makeObservable } from "mobx";
import { RootStore } from "@/stores/RootStore";
import RoomService from "@/service/room.service";
import { DEFAULT_PASSWORD, DEFAULT_THUMBNAIL } from "@/constants/default";
import roomService from "@/service/room.service";
import { RoomOverview } from "@/models/room/RoomOverview";

export class Room {
  readonly _id: string = "";
  readonly _master_id: string = "test";
  readonly _title: string = "test";
  readonly _thumbnail?: string = "test";
  readonly _password?: string = "test";
  readonly _timer: number = 40;
  readonly _short_break: number = 15;
  readonly _long_break: number = 20;
  readonly _long_break_interval: number = 3;
  readonly _expired_at: string = "2021-08-21T12:30:00.000Z";
  readonly _room_tag: string[] = [];
  constructor() {
    makeAutoObservable(this);
  }
}

export class RoomListStore {
  //TODO 방이 만들어지고 나서 tempRoom을 초기화 해야함
  private _pageNum: number = 0;
  private readonly _roomService: RoomService = new RoomService();
  readonly rootStore: RootStore;

  private rooms: Room[] = [];
  private tempRoom: Room = new Room();
  private roomOverviews: RoomOverview[] = [];
  constructor(root: RootStore) {
    makeAutoObservable(this);
    this.rootStore = root;
  }

  get_created_title() {
    return this.tempRoom._title;
  }
  get_roomOverviews() {
    return this.roomOverviews;
  }
  changeRoomNum(pageNum: string) {
    this._pageNum = parseInt(pageNum);
  }
  setRoomTitleInput(roomTitle: string) {
    this.tempRoom = { ...this.tempRoom, _title: roomTitle, _id: roomTitle };
  }
  async fetchRooms() {
    const result = await this._roomService.getRooms(this._pageNum);
    if (result.isSuccess) {
      this.roomOverviews = [];
      result._data?.map((roomOverview) => {
        this.roomOverviews.push(roomOverview);
      });
    } else {
      console.log(result.throwableOrNull());
    }
  }
  async createRoom(): Promise<boolean> {
    const result = await this._roomService.createRoom(this.tempRoom);
    if (result.isSuccess) {
      this.rooms.push(this.tempRoom);
      console.log(`(${this.tempRoom._id})방을 생성하였습니다`);
      return true;
    } else {
      console.log(result.throwableOrNull());
      return false;
    }
  }

  deleteRoom(id: string) {
    this.rooms = this.rooms.filter((room) => room._id !== id);
  }
}
