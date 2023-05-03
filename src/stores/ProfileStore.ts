import { RootStore } from "@/stores/RootStore";
import { makeAutoObservable, runInAction } from "mobx";
import profileService, { ProfileService } from "@/service/profile.service";
import { User } from "@/models/user/User";
import { UserStore } from "@/stores/UserStore";
import { NO_USER_STORE_ERROR_MESSAGE } from "@/constants/message";
import {
  TAG_DELETE_SUCCESS,
  TAG_DUPLICATED_ERROR,
  TAG_MAX_LENGTH_ERROR,
  TAG_SAVE_SUCCESS,
} from "@/constants/tag.constant";
import { validateUserTags } from "@/utils/user.validator";
import { USER_TAG_MAX_COUNT } from "@/constants/user.constant";

export class ProfileStore {
  readonly rootStore: RootStore;
  readonly userStore: UserStore;
  private _userOverview?: User = undefined;
  private _selectedImageFile?: File = undefined;
  private _typedTag: string = "";
  private _imageUrl?: string = undefined;
  private _nickName?: string = undefined;
  private _tags?: string[] = undefined;
  private _unsavedTags: string[] = [];
  private _introduce?: string | null = undefined;
  private _organizations?: string[] = undefined;
  private _errorMessage: string = "";
  private _successMessage: string = "";
  private _tagUpdateSuccessMessage: string = "";
  private _tagUpdateErrorMessage: string = "";
  private _editSuccess?: boolean = undefined;
  constructor(
    root: RootStore,
    private readonly _profileService: ProfileService = profileService
  ) {
    makeAutoObservable(this);
    this.rootStore = root;
    this.userStore = root.userStore;
  }

  public get errorMessage() {
    return this._errorMessage;
  }

  public get successMessage() {
    return this._successMessage;
  }

  public get tagUpdateSuccessMessage() {
    return this._tagUpdateSuccessMessage;
  }

  public get tagUpdateErrorMessage() {
    return this._tagUpdateErrorMessage;
  }

  public get unsavedTags() {
    return this._unsavedTags;
  }

  public get nickName() {
    return this._nickName;
  }

  public get tags() {
    return this._tags;
  }

  public get typedTag() {
    return this._typedTag;
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

  public get editSuccess() {
    return this._editSuccess;
  }

  importUserProfile = (profile: User) => {
    runInAction(() => {
      this._nickName = profile.name;
      this._introduce = profile.introduce;
      this._tags = profile.tags;
      this._organizations = profile.organizations;
    });
  };

  public onChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this._editSuccess = undefined;
    switch (e.target.id) {
      case "nickName":
        this._nickName = e.target.value;
        break;
      case "tags":
        this._typedTag = e.target.value;
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

  public enterTag = () => {
    try {
      if (this._tags!.some((tag) => tag === this._typedTag)) {
        throw TAG_DUPLICATED_ERROR;
      }
      if (this._tags!.length >= USER_TAG_MAX_COUNT) {
        this._tagUpdateErrorMessage = TAG_MAX_LENGTH_ERROR;
        throw TAG_MAX_LENGTH_ERROR;
      }
      if (this._typedTag) {
        this._tags!.push(this._typedTag);
        this._unsavedTags.push(this._typedTag);
        this._typedTag = "";
      }
    } catch (e) {
      if (typeof e === "string") {
        this._tagUpdateErrorMessage = e;
        this._tagUpdateSuccessMessage = "";
      }
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

  public updateProfile = async () => {
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
      const result = await this._profileService.updateProfile(
        this.userStore.currentUser.id,
        this._nickName,
        this._introduce,
        this._userOverview!.tags
      );
      if (result.isSuccess) {
        runInAction(() => {
          this._editSuccess = true;
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

  public updateTags = async () => {
    try {
      if (!this.userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      if (
        !this._userOverview ||
        !this._userOverview.name ||
        !this._userOverview.introduce ||
        !this._tags
      ) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const result = await this._profileService.updateProfile(
        this.userStore.currentUser.id,
        this._userOverview.name,
        this._userOverview.introduce,
        this._tags
      );
      if (result.isSuccess) {
        runInAction(() => {
          this._tagUpdateSuccessMessage = TAG_SAVE_SUCCESS;
          this._tagUpdateErrorMessage = "";
          this._unsavedTags = [];
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

  public deleteTag = async (tagName: string) => {
    try {
      if (this._unsavedTags.some((tag) => tag === tagName)) {
        this._tags = this._tags!.filter((tag) => tag !== tagName);
        return;
      }
      if (!this.userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const result = await this._profileService.deleteTag(
        this.userStore.currentUser.id,
        tagName
      );
      if (result.isSuccess) {
        runInAction(() => {
          this._userOverview = {
            ...this._userOverview!,
            tags: this._userOverview!.tags.filter((tag) => tag !== tagName),
          };
          this._tags = this._tags!.filter((tag) => tag !== tagName);
          this._tagUpdateSuccessMessage = TAG_DELETE_SUCCESS;
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
