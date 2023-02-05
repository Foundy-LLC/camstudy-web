import { action, makeAutoObservable, observable } from "mobx";
import { RootStore } from "@/stores/RootStore";
import RoomService from "@/service/room.service";
import Rooms from "@/pages/rooms";

export class Room {
  private _id: string = "";
  private _master_id: string = "";
  private _title: string = "";
  private _thumbnail: string | undefined = "";
  private _password: string | undefined = "";
  private _timer: number = 0;
  private _short_break: number = 0;
  private _long_break: number = 0;
  private _long_break_interval: number = 0;
  private _expired_at: string = "";
  constructor() {
    makeAutoObservable(this);
  }
  get id() {
    return this._id;
  }
  get master_id() {
    return this._master_id;
  }
  get title() {
    return this._title;
  }
  get thumbnail() {
    return this._thumbnail ? this._thumbnail : undefined;
  }
  get password() {
    return this._password ? this._password : undefined;
  }
  get timer() {
    return this._timer;
  }
  get short_break() {
    return this._short_break;
  }
  get long_break() {
    return this._long_break;
  }
  get long_break_interval() {
    return this._long_break_interval;
  }
  get expired_at() {
    return this._expired_at;
  }
  set id(id: string) {
    this._id = id;
  }
  set master_id(master_id: string) {
    this._master_id = master_id;
  }
  set title(title: string) {
    this._title = title;
  }
  set thumbnail(thumbnail: string) {
    this._thumbnail = thumbnail;
  }
  set password(password: string) {
    this._password = password;
  }
  set timer(timer: number) {
    this._timer = timer;
  }
  set short_break(short_break: number) {
    this._short_break = short_break;
  }
  set long_break(long_break: number) {
    this._long_break = long_break;
  }
  set long_break_interval(long_break_interval: number) {
    this._long_break_interval = long_break_interval;
  }
  set expired_at(id: string) {
    this._expired_at = id;
  }
  set_room(
    _id: string,
    _master_id: string,
    _title: string,
    _thumbnail: string | undefined,
    _password: string | undefined,
    _timer: number,
    _short_break: number,
    _long_break: number,
    _long_break_interval: number,
    _expired_at: string
  ) {
    this._id = _id;
    this._master_id = _master_id;
    this._title = _title;
    this._thumbnail = _thumbnail;
    this._password = _password;
    this._timer = _timer;
    this._short_break = _short_break;
    this._long_break = _long_break;
    this._long_break_interval = _long_break_interval;
    this._expired_at = _expired_at;
  }
}

export class RoomListStore {
  private _pageNum: number = 0;
  private _title: string = "";
  private _roomService: RoomService = new RoomService();
  rootStore: RootStore;

  rooms: Room[] = [];
  private tempRoom: Room = new Room();
  constructor(root: RootStore) {
    makeAutoObservable(this);
    this.rootStore = root;
  }

  changeRoomNum(pageNum: string) {
    this._pageNum = parseInt(pageNum);
  }
  setRoomTitle(roomTitle: string) {
    this.tempRoom.title = roomTitle;
  }
  async getRooms() {
    const value = await this._roomService.getRooms(this._pageNum);
    console.log("value", value._data);
    return value;
  }
  async createRoom() {
    this.rooms.push(this.tempRoom);
    await this._roomService.createRoom(this.tempRoom);
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
    const idx = this.rooms.findIndex((room) => room.id === id);
    const newRoom = new Room();
    newRoom.set_room(
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
    );
    this.rooms = [
      ...this.rooms.slice(0, idx),
      newRoom,
      ...this.rooms.slice(idx + 1, this.rooms.length),
    ];
  }
}
