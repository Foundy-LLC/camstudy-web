import { makeAutoObservable, makeObservable } from "mobx";
import { RootStore } from "@/stores/RootStore";
import RoomService from "@/service/room.service";
import { DEFAULT_PASSWORD, DEFAULT_THUMBNAIL } from "@/constants/default";
import roomService from "@/service/room.service";

export class Room {
  readonly _id: string = "";
  readonly _master_id: string = "test";
  readonly _title: string = "test";
  readonly _thumbnail: string | undefined = "test";
  readonly _password: string | undefined = "test";
  readonly _timer: number = 40;
  readonly _short_break: number = 15;
  readonly _long_break: number = 20;
  readonly _long_break_interval: number = 3;
  readonly _expired_at: string = "2021-08-21T12:30:00.000Z";
  constructor() {
    makeAutoObservable(this);
  }
  // set_room(
  //   _id: string,
  //   _master_id: string,
  //   _title: string,
  //   _thumbnail: string | undefined,
  //   _password: string | undefined,
  //   _timer: number,
  //   _short_break: number,
  //   _long_break: number,
  //   _long_break_interval: number,
  //   _expired_at: string
  // ) {
  //   this._id = _id;
  //   this._master_id = _master_id;
  //   this._title = _title;
  //   this._thumbnail = _thumbnail;
  //   this._password = _password;
  //   this._timer = _timer;
  //   this._short_break = _short_break;
  //   this._long_break = _long_break;
  //   this._long_break_interval = _long_break_interval;
  //   this._expired_at = _expired_at;
  // }
}

export class RoomListStore {
  private _pageNum: number = 0;
  private readonly _roomService: RoomService = new RoomService();
  readonly rootStore: RootStore;

  private rooms: Room[] = [];
  private tempRoom: Room = new Room();
  constructor(root: RootStore) {
    makeAutoObservable(this);
    this.rootStore = root;
  }

  changeRoomNum(pageNum: string) {
    this._pageNum = parseInt(pageNum);
  }
  setRoomTitleInput(roomTitle: string) {
    this.tempRoom =  {...this.tempRoom, _title: roomTitle, _id: roomTitle};
  }
  async fetchRooms() {
    const value = await this._roomService.getRooms(this._pageNum);
    console.log("value", value._data);
    return value;
  }
  async createRoom() {
    const result = await this._roomService.createRoom(this.tempRoom);
    if(result.isSuccess) {
      this.rooms.push(this.tempRoom);
    }
  }

  deleteRoom(id: string) {
    this.rooms = this.rooms.filter((room) => room._id !== id);
  }

  // changeRoomInfo(
  //   id: string,
  //   master_id: string,
  //   title: string,
  //   thumnail: string | undefined,
  //   password: string | undefined,
  //   timer: number,
  //   short_break: number,
  //   long_break: number,
  //   long_break_interval: number,
  //   expired_at: string
  // ) {
  //   const idx = this.rooms.findIndex((room) => room._id === id);
  //   const newRoom = new Room();
  //   newRoom.set_room(
  //     id,
  //     master_id,
  //     title,
  //     thumnail,
  //     password,
  //     timer,
  //     short_break,
  //     long_break,
  //     long_break_interval,
  //     expired_at
  //   );
  //   this.rooms = [
  //     ...this.rooms.slice(0, idx),
  //     newRoom,
  //     ...this.rooms.slice(idx + 1, this.rooms.length),
  //   ];
  // }
}
