import { RootStore } from "@/stores/RootStore";
import { makeAutoObservable, runInAction } from "mobx";
import profileService, { ProfileService } from "@/service/profile.service";
import { User } from "@/models/user/User";
import { UserStore } from "@/stores/UserStore";
import {
  NO_USER_STORE_ERROR_MESSAGE,
  PROFILE_NICKNAME_NULL_ERROR,
} from "@/constants/message";
import {
  TAG_DUPLICATED_ERROR,
  TAG_MAX_LENGTH_ERROR,
  TAG_UPDATE_SUCCESS,
} from "@/constants/tag.constant";
import { USER_TAG_MAX_COUNT } from "@/constants/user.constant";
import { Tag } from "@/models/welcome/Tag";
import { welcomeService, WelcomeService } from "@/service/welcome.service";
import userService, { UserService } from "@/service/user.service";

export class ProfileStore {
  readonly rootStore: RootStore;
  readonly userStore: UserStore;
  private _userOverview?: User = undefined;
  private _selectedImageFile?: File = undefined;
  private _typedTag: string = "";
  private _tagDropDownHidden: boolean = true;
  private _imageUrl?: string = undefined;
  private _imageFile?: File = undefined;
  private _nickName?: string = undefined;
  private _tags?: string[] = undefined;
  private _recommendTags: Tag[] = [];
  private _unsavedTags: string[] = [];
  private _deletedTags: string[] = [];
  private _introduce?: string | null = undefined;
  private _organizations?: string[] = undefined;
  private _errorMessage: string = "";
  private _successMessage: string = "";
  private _profileImageChanged: boolean = false;
  private _tagUpdateSuccessMessage: string = "";
  private _tagUpdateErrorMessage: string = "";
  private _imageUpdateSuccessMessage: string = "";
  private _imageUpdateErrorMessage: string = "";
  private _editNameErrorMessage?: string = undefined;
  private _editSuccess?: boolean = undefined;

  constructor(
    root: RootStore,
    private readonly _profileService: ProfileService = profileService,
    private readonly _welcomeService: WelcomeService = welcomeService,
    private readonly _userService: UserService = userService
  ) {
    makeAutoObservable(this);
    this.rootStore = root;
    this.userStore = root.userStore;
  }

  public get editNameErrorMessage() {
    return this._editNameErrorMessage;
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

  public get deletedTags() {
    return this._deletedTags;
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

  public get recommendTags() {
    return this._recommendTags;
  }

  public get tagDropDownHidden() {
    return this._tagDropDownHidden;
  }

  public get userOverview() {
    return this._userOverview;
  }

  public get isTagInputDisable(): boolean {
    if (!this.userOverview) return false;
    console.log(
      this.userOverview.tags.length,
      this._unsavedTags.length,
      this._deletedTags.length
    );
    return (
      this.userOverview.tags.length +
        this._unsavedTags.length -
        this._deletedTags.length <
      3
    );
  }

  public setTagDropDownHidden(hidden: boolean) {
    this._tagDropDownHidden = hidden;
  }

  public importProfileImage = (profileImage: File) => {
    runInAction(() => {
      if (!profileImage) return;
      this._selectedImageFile = profileImage;
      this._imageFile = profileImage;
      this._imageUrl = URL.createObjectURL(profileImage);
      this._profileImageChanged = true;
      this._editSuccess = false;
    });
  };

  public importUserProfile = (profile: User) => {
    runInAction(() => {
      this._nickName = profile.name;
      this._introduce = profile.introduce;
      this._tags = profile.tags;
      this._organizations = profile.organizations;
      this._imageUrl = profile.profileImage;
    });
  };

  public onChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    this._editSuccess = undefined;
    switch (e.target.id) {
      case "nickName":
        runInAction(() => {
          this._nickName = e.target.value;
          if (this._nickName === "") {
            console.log("1");
            this._editNameErrorMessage = PROFILE_NICKNAME_NULL_ERROR;
          } else {
            console.log("2");
            this._editNameErrorMessage = undefined;
          }
        });
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

  public initRecommendTags() {
    runInAction(() => {
      this._recommendTags = [];
    });
  }

  public enterTag = async (tagName: string) => {
    try {
      if (this._tags!.some((tag) => tag === this._typedTag)) {
        throw TAG_DUPLICATED_ERROR;
      }
      if (this._tags!.length >= USER_TAG_MAX_COUNT) {
        this._tagUpdateErrorMessage = TAG_MAX_LENGTH_ERROR;
        throw TAG_MAX_LENGTH_ERROR;
      }
      this._tags!.push(tagName);
      if (this._deletedTags.some((tag) => tag === tagName)) {
        this._deletedTags = this._deletedTags!.filter((tag) => tag !== tagName);
      } else {
        this._unsavedTags.push(tagName);
      }
      this.initRecommendTags();
      this._typedTag = "";
      this._tagUpdateErrorMessage = "";
    } catch (e) {
      if (typeof e === "string") {
        this._tagUpdateErrorMessage = e;
        this._tagUpdateSuccessMessage = "";
      }
    }
  };

  public getUserProfile = async (userId: string) => {
    try {
      if (!this.userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const result = await this._profileService.getUserProfile(
        userId,
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

  public undoProfile = () => {
    runInAction(() => {
      if (!this.userOverview) return;
      this._introduce = this.userOverview.introduce;
      this._nickName = this.userOverview.name;
      this._imageUrl = this.userOverview.profileImage;
    });
  };

  public updateProfileImage = async () => {
    try {
      if (!this._imageFile) return;
      const uid = this.userOverview!.id;
      const formData = new FormData();
      formData.append("fileName", uid);
      formData.append("profileImage", this._imageFile!);
      const uploadProfileImageResult =
        await this._userService.uploadProfileImage(uid, formData);
      if (uploadProfileImageResult.isSuccess) {
        runInAction(() => {
          this._imageUrl = uploadProfileImageResult.getOrNull()!;
          this._imageUpdateSuccessMessage =
            "프로필 사진을 성공적으로 업데이트 했습니다.";
          console.log("프로필 사진 업데이트 성공");
          this._imageFile = undefined;
        });
      } else {
        throw new Error(uploadProfileImageResult.throwableOrNull()!.message);
        return;
      }
    } catch (e) {
      console.log("프로필 사진 업데이트 실패");
      if (e instanceof Error) this._imageUpdateErrorMessage = e.message;
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
            consecutiveStudyDays: this._userOverview!.consecutiveStudyDays,
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

  public saveTagsButtonOnClick = async () => {
    this._deletedTags.map(async (tag) => await this.deleteTags(tag));
    await this.updateTags();
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
          this._tagUpdateSuccessMessage = TAG_UPDATE_SUCCESS;
          this._tagUpdateErrorMessage = "";
          this._userOverview! = {
            ...this._userOverview!,
            tags: [...this._userOverview!.tags, ...this._unsavedTags],
          };
          this._unsavedTags = [];
          this._deletedTags = [];
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

  public addDeletedTag = (tagName: string) => {
    if (this._unsavedTags.some((tag) => tag === tagName)) {
      this._unsavedTags = this._unsavedTags!.filter((tag) => tag !== tagName);
    } else {
      this._deletedTags.push(tagName);
    }
    this._tags = this._tags!.filter((tag) => tag !== tagName);
  };

  public deleteTags = async (tagName: string) => {
    try {
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
          this._tagUpdateSuccessMessage = TAG_UPDATE_SUCCESS;
          this._unsavedTags = this._unsavedTags.filter(
            (tag) => tag !== tagName
          );
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

  public async onChangeTagInput(tag: string) {
    try {
      this._typedTag = tag;
      if (tag === "") {
        this.initRecommendTags();
        return;
      }
      const result = await this._welcomeService.getTags(this._typedTag);
      if (result.isSuccess) {
        runInAction(() => {
          this._tagUpdateErrorMessage = "";
          this._recommendTags = result.getOrNull()!;
        });
      } else {
        runInAction(() => {
          this._tagUpdateSuccessMessage = "";
          this._errorMessage = result.throwableOrNull()!.message;
        });
      }
    } catch (e) {
      runInAction(() => {
        if (e instanceof Error) this._errorMessage = e.message;
      });
    }
  }
}
