import { makeAutoObservable } from "mobx";
import { RootStore } from "@/stores/RootStore";
import RoomService from "@/service/room.service";
import { RoomOverview } from "@/models/room/RoomOverview";
import React from "react";

export class Room {
  //TODO(건우) 값을 임시로 할당하여 수정 필요
  readonly id: string = "";
  readonly masterId: string = "test";
  readonly title: string = "test";
  readonly thumbnail?: string = "test";
  readonly password?: string = "test";
  readonly timer: number = 40;
  readonly shortBreak: number = 15;
  readonly longBreak: number = 20;
  readonly longBreakInterval: number = 3;
  readonly expiredAt: string = "2021-08-21T12:30:00.000Z";
  readonly tags: string[] = [];

  constructor() {
    makeAutoObservable(this);
  }
}

export class RoomListStore {
  //TODO(건우) 방이 만들어지고 나서 tempRoom을 초기화 해야함
  private readonly _roomService: RoomService = new RoomService();
  readonly rootStore: RootStore;
  private _createdRoomTitle: string = "";

  private _rooms: Room[] = [];
  private _tempRoom: Room = new Room();
  private _roomOverviews: RoomOverview[] = [];
  private _pageNum: number = 0;
  private _isSuccessCreate: boolean = false;
  private _isSuccessGet: boolean = false;
  private _errorMessage: string = "";
  constructor(root: RootStore) {
    makeAutoObservable(this);
    this.rootStore = root;
  }

  get errorMessage() {
    return this._errorMessage;
  }
  get createdTitle() {
    return this._createdRoomTitle;
  }

  get roomOverviews() {
    return this._roomOverviews;
  }

  get isSuccessCreate() {
    return this._isSuccessCreate;
  }
  get isSuccessGet() {
    return this._isSuccessGet;
  }

  private _initRoomOverviews() {
    this._roomOverviews = [];
  }

  changeRoomNum(pageNum: string) {
    this._pageNum = parseInt(pageNum);
  }

  setRoomTitleInput(roomTitle: string) {
    this._tempRoom = { ...this._tempRoom, title: roomTitle, id: roomTitle };
  }

  fetchRooms = async (): Promise<void> => {
    const result = await this._roomService.getRooms(this._pageNum);
    if (result.isSuccess) {
      this._isSuccessGet = true;
      this._roomOverviews = result.getOrNull()!!;
    } else {
      console.log(result.throwableOrNull());
      this._errorMessage = result.throwableOrNull()!!.message;
      this._isSuccessGet = false;
    }
  };

  createRoom = async (): Promise<void> => {
    const result = await this._roomService.createRoom(this._tempRoom);
    if (result.isSuccess) {
      this._isSuccessCreate = true;
      this._rooms.push(this._tempRoom);
      this._createdRoomTitle = this._tempRoom.title;
      console.log(`(${this._tempRoom.id})방을 생성하였습니다`);
    } else {
      console.log(result.throwableOrNull());
      this._errorMessage = result.throwableOrNull()!!.message;
      this._isSuccessCreate = false;
    }
  };

  deleteRoom(id: string) {
    this._rooms = this._rooms.filter((room) => room.id !== id);
  }
}
