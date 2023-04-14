import { RootStore } from "@/stores/RootStore";
import { makeAutoObservable, runInAction } from "mobx";
import profileService, { ProfileService } from "@/service/profile.service";
import { User } from "@/models/user/User";
import { UserStore } from "@/stores/UserStore";
import { NO_USER_STORE_ERROR_MESSAGE } from "@/constants/message";

export class ProfileStore {
  readonly rootStore: RootStore;
  readonly userStore: UserStore;
  private _userOverview?: User = undefined;
  private _selectedImageFile?: File = undefined;
  private _imageUrl: string = "";
  private _errorMessage: string = "";

  constructor(
    root: RootStore,
    private readonly _profileService: ProfileService = profileService
  ) {
    makeAutoObservable(this);
    this.rootStore = root;
    this.userStore = root.userStore;
  }

  public get userOverview() {
    return this._userOverview;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  public importProfileImage = (thumbnail: File) => {
    this._selectedImageFile = thumbnail;
    this._imageUrl = URL.createObjectURL(thumbnail);
  };

  public getUserProfile = async () => {
    try {
      if (!this.userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const result = await this._profileService.getUserProfile(
        this.userStore.currentUser.id
      );
      if (result.isSuccess) {
        runInAction(() => {
          console.log(result);
          this._userOverview = result.getOrNull();
        });
      } else {
        runInAction(() => {
          throw new Error(result.throwableOrNull()!.message);
        });
      }
    } catch (e) {
      runInAction(() => {
        if (e instanceof Error) this._errorMessage = e.message;
      });
    }
  };
}
