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
  private _imageUrl?: string = undefined;
  private _nickName?: string = undefined;
  private _tags?: string[] = undefined;
  private _introduce?: string | null = undefined;
  private _organizations?: string[] = undefined;
  private _errorMessage: string = "";
  private _amendSuccess?: boolean;
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

  public get nickName() {
    return this._nickName;
  }

  public get tags() {
    return this._tags;
  }

  public get introduce() {
    return this._introduce;
  }

  public get organizations() {
    return this._organizations;
  }

  public get imageUrl() {
    return this._imageUrl;
  }

  public get amendSuccess() {
    return this._amendSuccess;
  }

  importUserProfile = (profile: User) => {
    this._nickName = profile.name;
    this._introduce = profile.introduce;
    this._tags = profile.tags;
    this._organizations = profile.organizations;
  };

  public onChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this._amendSuccess = undefined;
    switch (e.target.id) {
      case "nickName":
        this._nickName = e.target.value;
        break;
      case "tags":
        this._tags = this._tags
          ? [...this._tags, e.target.value]
          : [e.target.value];
        break;
      case "introduce":
        this._introduce = e.target.value;
        break;
      case "organization":
        this._organizations = this._organizations
          ? [...this._organizations, e.target.value]
          : [e.target.value];
        break;
    }
  };

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
          this._userOverview = result.getOrNull();
          this.importUserProfile(this._userOverview!);
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

  public amendProfile = async () => {
    try {
      if (!this.userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      if (
        !this._nickName ||
        !this._introduce ||
        !this._organizations ||
        !this._tags
      ) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const result = await this._profileService.amendProfile(
        this.userStore.currentUser.id,
        this._nickName,
        this._introduce,
        this._tags
      );
      if (result.isSuccess) {
        console.log("success");
        runInAction(() => {
          this._amendSuccess = true;
          this._userOverview = {
            id: this._userOverview!.id,
            name: this._nickName!,
            introduce: this._introduce!,
            tags: this._tags!,
            organizations: this._userOverview!.organizations,
          };
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
