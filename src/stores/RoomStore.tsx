import { action, makeAutoObservable, observable } from "mobx";
import { RootStore } from "@/stores/RootStore";
import RoomService from "@/service/room.service";

export class Room {
  constructor(
    readonly _id: string,
    readonly _master_id: string,
    readonly _title: string,
    readonly _thumnail: string | undefined,
    readonly _password: string | undefined,
    readonly _timer: number,
    readonly _short_break: number,
    readonly _long_break: number,
    readonly _long_break_interval: number,
    readonly _expired_at: string
  ) {
    makeAutoObservable(this);
  }
}

export class RoomStore {
  private _pageNum: number = 0;
  private _roomService: RoomService = new RoomService();
  rootStore;

  rooms: Room[] = [];

  constructor(root: RootStore) {
    makeAutoObservable(this);
    this.rootStore = root;
  }

  changeRoomNum(pageNum: number) {
    this._pageNum = pageNum;
  }
  getRooms() {
    this._roomService.getRoom(this._pageNum);
  }
  createRoom(
    id: string,
    master_id: string,
    title: string,
    thumbnail: string | undefined,
    password: string | undefined,
    timer: number,
    short_break: number,
    long_break: number,
    long_break_interval: number,
    expired_at: string
  ) {
    const roomIndex = this.rooms.findIndex((room: Room) => room._id === id);
    if (roomIndex !== undefined) {
      this.rooms = [
        ...this.rooms,
        new Room(
          id,
          master_id,
          title,
          thumbnail,
          password,
          timer,
          short_break,
          long_break,
          long_break_interval,
          expired_at
        ),
      ];
    }
  }

  deleteRoom(id: string) {
    this.rooms = this.rooms.filter((x) => x._id !== id);
  }

  changeRoomInfo(
    id: string,
    master_id: string,
    title: string,
    thumnail: string | undefined,
    password: string | undefined,
    timer: number,
    short_break: number,
    long_break: number,
    long_break_interval: number,
    expired_at: string
  ) {
    const idx = this.rooms.findIndex((x) => x._id === id);
    const room = this.rooms[idx];

    this.rooms = [
      ...this.rooms.slice(0, idx),
      new Room(
        id,
        master_id,
        title,
        thumnail,
        password,
        timer,
        short_break,
        long_break,
        long_break_interval,
        expired_at
      ),
      ...this.rooms.slice(idx + 1, this.rooms.length),
    ];
  }
}
