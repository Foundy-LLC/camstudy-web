import { action, makeAutoObservable, observable } from "mobx";
import { RootStore } from "@/stores/RootStore";

class Room {
  private _id: string = "";
  private _master_id: string = "";
  private _title: string = "";
  private _thumnail: string | undefined;
  private _password: string | undefined;
  private _timer: number = 0;
  private _short_break: number = 0;
  private _long_break: number = 0;
  private _long_break_interval: number = 0;
  private _expired_at: string = "";

  constructor() {
    makeAutoObservable(this);
  }
}

export class RoomStore {
  rootStore;

  rooms: Room[] = [];

  constructor(root: RootStore) {
    makeAutoObservable(this);
    this.rootStore = root;
  }

  createRoom(
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
    const idx = this.rooms.findIndex((x) => x.id === id);
    if (idx !== undefined) {
      this.rooms = [
        ...this.rooms,
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
      ];
    }
  }

  deleteRoom(id: string) {
    this.rooms = this.rooms.filter((x) => x.id !== id);
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
    const idx = this.rooms.findIndex((x) => x.id === id);
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
