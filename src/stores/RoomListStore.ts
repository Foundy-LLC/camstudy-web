import { computed, makeAutoObservable, runInAction } from "mobx";
import { RootStore } from "@/stores/RootStore";
import roomService, { RoomService } from "@/service/room.service";
import { RoomOverview } from "@/models/room/RoomOverview";
import { ROOM_NUM_PER_PAGE } from "@/constants/room.constant";
import { string } from "prop-types";
import {
  CREATE_ROOM_TITLE_MAX_LENGTH_ERROR,
  ROOM_TAG_DUPLICATED_ERROR,
} from "@/constants/message";
import { UserStore } from "@/stores/UserStore";

//TODO(건우) 값을 임시로 할당하여 수정 필요
export class Room {
  constructor(
    readonly id: string = "",
    readonly masterId: string = "",
    readonly title: string = "",
    readonly thumbnail: string | undefined = undefined,
    readonly password: string | undefined = undefined,
    readonly timer: number = 30,
    readonly shortBreak: number = 10,
    readonly longBreak: number = 20,
    readonly longBreakInterval: number = 3,
    readonly expiredAt: Date = new Date(),
    readonly deleted_at: Date | undefined = undefined,
    readonly tags: string[] = []
  ) {
    makeAutoObservable(this);
  }
}

//TODO(건우) 방이 만들어지고 나서 tempRoom을 초기화 해야함
export class RoomListStore {
  readonly rootStore: RootStore;
  readonly userStore: UserStore;
  private _createRoomTagsError?: string = undefined;
  private _createRoomPasswordError?: string = undefined;
  private _createdRoomOverview?: RoomOverview = undefined;
  private _typedPassword?: string = undefined;
  private _isRoomPrivate: boolean = false;
  private _selectedImageFile?: File = undefined;
  private _imageUrl: string = "";
  private _uploadedImgUrl?: string = "";
  private _isExistNextPage: boolean = true;
  private _roomOverviews: RoomOverview[] = [];
  private _recentRoomOverviews: RoomOverview[] = [];
  private _pageNum: number = 0;
  private _isSuccessCreate?: boolean = undefined;
  private _isSuccessGet: boolean = false;
  private _isSuccessDelete: boolean = false;
  private _errorMessage: string = "";
  private _tempRoom: Room = new Room();
  private _roomExpirate: number = 2;
  private _searchRoomNameInput: string = "";
  private _roomInfo?: RoomOverview = undefined;
  constructor(
    root: RootStore,
    private readonly _roomService: RoomService = roomService
  ) {
    makeAutoObservable(this);
    this.rootStore = root;
    this.userStore = root.userStore;
  }

  get createRoomTagsError() {
    return this._createRoomTagsError;
  }

  get errorMessage(): string {
    return this._errorMessage;
  }

  get tempRoom(): Room {
    return this._tempRoom;
  }

  get roomOverviews(): RoomOverview[] {
    return this._roomOverviews;
  }

  get recentRoomOverviews(): RoomOverview[] {
    return this._recentRoomOverviews;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get isSuccessCreate(): boolean | undefined {
    return this._isSuccessCreate;
  }

  get isSuccessGet(): boolean {
    return this._isSuccessGet;
  }

  get pageNum() {
    return this._pageNum;
  }

  get isSuccessImportImage(): boolean {
    return this._imageUrl !== "";
  }

  get isExistNextPage() {
    return this._isExistNextPage;
  }

  get roomInfo() {
    return this._roomInfo;
  }

  get isPasswordValid() {
    if (this._isRoomPrivate) {
      return this._typedPassword ? this._typedPassword.length >= 4 : false;
    }
    return true;
  }

  get createdRoomOverview() {
    return this._createdRoomOverview;
  }

  get isCreateButtonEnable(): boolean {
    return (
      this._tempRoom.title.length > 0 &&
      this._tempRoom.tags.length > 0 &&
      this.isPasswordValid
    );
  }

  private _initErrorMessage() {
    this._errorMessage = "";
  }

  private _setRoomExpirationDate() {
    const date = new Date();
    date.setDate(date.getDate() + this._roomExpirate);
    this._tempRoom = { ...this._tempRoom, expiredAt: date };
  }

  public setIsExistNextPageToFalse() {
    this._isExistNextPage = false;
  }

  public setMasterId = (masterId: string) => {
    this._tempRoom = { ...this._tempRoom, masterId: masterId };
  };
  public importRoomThumbnail = (thumbnail: File) => {
    this._selectedImageFile = thumbnail;
    this._imageUrl = URL.createObjectURL(thumbnail);
  };

  public initImageUrl = () => {
    this._imageUrl = "";
  };

  public initTempRoom() {
    this._tempRoom = new Room();
    this._imageUrl = "";
    this._isSuccessCreate = undefined;
    this._isRoomPrivate = false;
  }

  public addTypedTag = (tag: string) => {
    if (this._tempRoom.tags.includes(tag)) {
      this._createRoomTagsError = ROOM_TAG_DUPLICATED_ERROR;
      return;
    }
    this._createRoomTagsError = undefined;
    this._tempRoom = { ...this._tempRoom, tags: [...this.tempRoom.tags, tag] };
  };

  public removeTypedTag = (tagName: string) => {
    runInAction(() => {
      this._tempRoom = {
        ...this._tempRoom,
        tags: this.tempRoom.tags.filter((tag) => tag !== tagName),
      };
    });
  };

  public setTypedPassword = (password: string) => {
    this._typedPassword = password;
  };

  public changeRoomNum(pageNum: string) {
    this._pageNum = parseInt(pageNum);
  }

  public toggleIsRoomPrivate() {
    this._isRoomPrivate = !this._isRoomPrivate;
  }

  get isRoomPrivate() {
    return this._isRoomPrivate;
  }

  //TODO(건우): RoomId를 임시적으로 title로 설정하도록 함. 수정 필요
  public setRoomTitleInput(roomTitle: string) {
    this._tempRoom = { ...this._tempRoom, title: roomTitle, id: roomTitle };
  }

  public setSearchRoomNameInput(roomName: string) {
    this._searchRoomNameInput = roomName;
    this._pageNum = 0;
    this._roomOverviews = [];
    this._isExistNextPage = false;
  }

  public getRoomById = async (roomId: string) => {
    try {
      const result = await this._roomService.getRoom(roomId);
      if (result.isSuccess) {
        runInAction(() => {
          this._initErrorMessage();
          this._isSuccessGet = true;
          this._roomInfo = result.getOrNull()!!;
        });
      } else {
        runInAction(() => {
          this._errorMessage = result.throwableOrNull()!!.message;
        });
      }
    } catch (e) {
      runInAction(() => {
        if (e instanceof Error) this._errorMessage = e.message;
      });
    }
  };

  public fetchRooms = async (): Promise<void> => {
    const getRoomsResult = await this._roomService.getRooms(
      this._pageNum,
      this._searchRoomNameInput
    );
    this._pageNum += 1;
    if (getRoomsResult.isSuccess) {
      runInAction(() => {
        this._initErrorMessage();
        this._isSuccessGet = true;
        const roomList = getRoomsResult.getOrNull()!!;
        if (roomList.length === ROOM_NUM_PER_PAGE) this._isExistNextPage = true;
        if (roomList.length === 0) {
          this._isExistNextPage = false;
        } else {
          this._roomOverviews = this._roomOverviews.concat(roomList);
        }
      });
    } else {
      runInAction(() => {
        this._errorMessage = getRoomsResult.throwableOrNull()!!.message;
        this._isSuccessGet = false;
      });
    }
  };

  public fetchRecentRooms = async (userId: string): Promise<void> => {
    const getRecentRoomsResult = await this._roomService.getRecentRooms(userId);
    if (getRecentRoomsResult.isSuccess) {
      runInAction(() => {
        this._initErrorMessage();
        this._isSuccessGet = true;
        this._recentRoomOverviews = getRecentRoomsResult.getOrNull()!!;
      });
    } else {
      runInAction(() => {
        this._errorMessage = getRecentRoomsResult.throwableOrNull()!!.message;
        this._isSuccessGet = false;
      });
    }
  };

  public createRoom = async (): Promise<void> => {
    if (!this.userStore.currentUser) return;
    if (this._isRoomPrivate) {
      this._tempRoom = { ...this._tempRoom, password: this._typedPassword };
    }
    const result = await this._roomService.createRoom(this._tempRoom);
    if (result.isSuccess) {
      runInAction(() => {
        this._initErrorMessage();
        this._createdRoomOverview = result.getOrNull();
        console.log("success");
      });
    } else {
      runInAction(() => {
        this._errorMessage = result.throwableOrNull()!!.message;
        console.log("fail", this._errorMessage);
        this._isSuccessCreate = false;
      });
      return;
    }
    // 사용자가 선택한 이미지를 업로드
    if (this.isSuccessImportImage) {
      const formData = new FormData();
      formData.append("roomThumbnail", this._selectedImageFile!!);

      const uploadThumbnailImgResult =
        await this._roomService.uploadThumbnailImage(
          this._createdRoomOverview!.id,
          formData
        );
      //실패 시 에러 메세지 출력
      if (uploadThumbnailImgResult.isSuccess) {
        runInAction(() => {
          this._createdRoomOverview! = {
            ...this._createdRoomOverview!,
            thumbnail:
              uploadThumbnailImgResult.getOrNull() !== undefined
                ? uploadThumbnailImgResult.getOrNull()!
                : null,
          };
        });
        console.log("썸네일 success");
      } else {
        runInAction(() => {
          this._errorMessage =
            uploadThumbnailImgResult.throwableOrNull()!!.message;
          console.log("썸네일 fail", this._errorMessage);
          this._isSuccessCreate = false;
        });
        return;
      }
    }
    runInAction(() => {
      this._isSuccessCreate = true;
    });
  };

  public deleteRoom = async (id: string) => {
    const deleteRoomResult = await this._roomService.deleteRoom(id);
    if (!deleteRoomResult.isSuccess) {
      runInAction(() => {
        this._errorMessage = deleteRoomResult.throwableOrNull()!!.message;
        this._isSuccessDelete = false;
      });
    } else {
      runInAction(() => {
        this._initErrorMessage();
        this._isSuccessDelete = true;
        this._roomOverviews = this._roomOverviews.filter(
          (roomOverview) => roomOverview.id !== id
        );
      });
    }
  };
}
