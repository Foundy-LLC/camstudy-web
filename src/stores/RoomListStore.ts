import { makeAutoObservable, runInAction } from "mobx";
import { RootStore } from "@/stores/RootStore";
import roomService, { RoomService } from "@/service/room.service";
import { RoomOverview } from "@/models/room/RoomOverview";
import { ROOM_NUM_PER_PAGE } from "@/constants/room.constant";

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
  private _createdRoomTitle: string = "";
  private _selectedImageFile?: File = undefined;
  private _imageUrl: string = "";
  private _uploadedImgUrl?: string = "";
  private _isExistNextPage: boolean = true;
  private _rooms: Room[] = [];
  private _roomOverviews: RoomOverview[] = [];
  private _recentRoomOverviews: RoomOverview[] = [];
  private _pageNum: number = 0;
  private _isSuccessCreate: boolean = false;
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

  get recentRoomOverviews(): RoomOverview[] {
    return this._recentRoomOverviews;
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

  public changeRoomThumbnail = (uploadedImgUrl: string) => {
    this._tempRoom = { ...this._tempRoom, thumbnail: uploadedImgUrl };
  };

  public changeRoomNum(pageNum: string) {
    this._pageNum = parseInt(pageNum);
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
    // 사용자가 선택한 이미지를 업로드
    if (this.isSuccessImportImage) {
      const formData = new FormData();
      formData.append("roomThumbnail", this._selectedImageFile!!);

      const uploadThumbnailImgResult =
        await this._roomService.uploadThumbnailImage(
          this._tempRoom.id,
          formData
        );
      //실패 시 에러 메세지 출력
      if (!uploadThumbnailImgResult.isSuccess) {
        runInAction(() => {
          this._errorMessage =
            uploadThumbnailImgResult.throwableOrNull()!!.message;
        });
        return;
      }
      runInAction(() => {
        this._uploadedImgUrl = uploadThumbnailImgResult.getOrNull();
        this.changeRoomThumbnail(this._uploadedImgUrl!!);
      });
      //성공 시 tempRoom의 썸네일을 해당 url로 변경
    }
    runInAction(() => {
      //방의 유효기간을 현재로 설정
      this._setRoomExpirationDate();
    });
    const result = await this._roomService.createRoom(this._tempRoom);
    if (!result.isSuccess) {
      runInAction(() => {
        console.log("fail");
        this._errorMessage = result.throwableOrNull()!!.message;
        this._isSuccessCreate = false;
      });
      return;
    }
    runInAction(() => {
      this._initErrorMessage();
      this._rooms.push(this._tempRoom);
      this._isSuccessCreate = true;
      this._createdRoomTitle = this._tempRoom.title;
    });
    console.log(`(${this._tempRoom.id})방을 생성하였습니다`);
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
