import { makeAutoObservable } from "mobx";
import { RootStore } from "@/stores/RootStore";
import { RoomService } from "@/service/room.service";
import { RoomOverview } from "@/models/room/RoomOverview";
import React from "react";
import roomService from "@/service/room.service";

//TODO(건우) 값을 임시로 할당하여 수정 필요
export class Room {
  constructor(
    readonly id: string = "",
    readonly masterId: string = "test",
    readonly title: string = "",
    readonly thumbnail: string | undefined = undefined,
    readonly password: string | undefined = undefined,
    readonly timer: number = 30,
    readonly shortBreak: number = 10,
    readonly longBreak: number = 20,
    readonly longBreakInterval: number = 3,
    readonly expiredAt: string = "2021-08-21T12:30:00.000Z",
    readonly tags: string[] = []
  ) {
    makeAutoObservable(this);
  }
}
//TODO(건우) 방이 만들어지고 나서 tempRoom을 초기화 해야함
export class RoomListStore {
  readonly rootStore: RootStore;
  private _createdRoomTitle: string = "";
  private _selectedImageFile?: File = undefined;
  private _imageUrl: string = "";
  private _uploadedImgUrl?: string = "";
  private _rooms: Room[] = [];
  private _roomOverviews: RoomOverview[] = [];
  private _pageNum: number = 0;
  private _isSuccessCreate: boolean = false;
  private _isSuccessGet: boolean = false;
  private _errorMessage: string = "";
  private _tempRoom: Room = new Room();
  constructor(
    root: RootStore,
    private readonly _roomService: RoomService = roomService
  ) {
    makeAutoObservable(this);
    this.rootStore = root;
  }

  get errorMessage(): string {
    return this._errorMessage;
  }

  get tempRoom(): Room {
    return this._tempRoom;
  }

  get createdTitle(): string {
    return this._createdRoomTitle;
  }

  get roomOverviews(): RoomOverview[] {
    return this._roomOverviews;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get isSuccessCreate(): boolean {
    return this._isSuccessCreate;
  }

  get isSuccessGet(): boolean {
    return this._isSuccessGet;
  }

  get isSuccessImportImage(): boolean {
    return this._imageUrl !== "";
  }

  private _initRoomOverviews() {
    this._roomOverviews = [];
  }

  setThumbnailUndefined = () => {
    this._tempRoom = { ...this.tempRoom, thumbnail: undefined };
  };

  setPasswordUndefined = () => {
    this._tempRoom = { ...this.tempRoom, password: undefined };
  };

  importRoomThumbnail = (thumbnail: File) => {
    this._selectedImageFile = thumbnail;
    this._imageUrl = URL.createObjectURL(thumbnail);
  };

  changeRoomThumbnail = (uploadedImgUrl: string) => {
    this._tempRoom = { ...this._tempRoom, thumbnail: uploadedImgUrl };
  };

  changeRoomNum(pageNum: string) {
    this._pageNum = parseInt(pageNum);
  }
  //TODO(건우): RoomId를 임시적으로 title로 설정하도록 함. 수정 필요
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
    if (this.isSuccessImportImage) {
      const formData = new FormData();
      formData.append("roomId", this._tempRoom.id);
      formData.append("roomThumbnail", this._selectedImageFile!!);

      const uploadThumbnailImgResult =
        await this._roomService.uploadThumbnailImage(
          this._tempRoom.id,
          formData
        );
      if (!uploadThumbnailImgResult.isSuccess) {
        this._errorMessage =
          uploadThumbnailImgResult.throwableOrNull()!!.message;
        return;
      }
      this._uploadedImgUrl = uploadThumbnailImgResult.getOrNull();
      this.changeRoomThumbnail(this._uploadedImgUrl!!);
    }

    const result = await this._roomService.createRoom(this._tempRoom);
    if (!result.isSuccess) {
      this._errorMessage = result.throwableOrNull()!!.message;
      this._isSuccessCreate = false;
      return;
    }
    this._rooms.push(this._tempRoom);
    this._isSuccessCreate = true;
    this._createdRoomTitle = this._tempRoom.title;
    console.log(`(${this._tempRoom.id})방을 생성하였습니다`);
  };

  deleteRoom(id: string) {
    this._rooms = this._rooms.filter((room) => room.id !== id);
  }
}
