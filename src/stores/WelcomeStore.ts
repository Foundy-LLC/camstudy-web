import { makeAutoObservable, runInAction } from "mobx";
import userService, { UserService } from "@/service/user.service";
import {
  validateUserIntroduce,
  validateUserName,
  validateUserProfileImage,
  validateUserTags,
} from "@/utils/user.validator";
import userStore from "@/stores/UserStore";
import { welcomeService, WelcomeService } from "@/service/welcome.service";
import { Tag } from "@/models/welcome/Tag";

export class WelcomeStore {
  private _profileImage?: File;
  private _name: string = "";
  private _introduce: string = "";
  private _tags: string = "";
  private _tag = "";
  private _recommendTags: Tag[] = [];

  private _profileImageChanged: boolean = false;
  private _nameChanged: boolean = false;
  private _introduceChanged: boolean = false;
  private _tagsChanged: boolean = false;

  private _errorMessage?: string = undefined;
  private _successToCreate: boolean = false;
  private _successMessage: string | undefined = undefined;

  constructor(
    private readonly _userService: UserService = userService,
    private readonly _welcomeService: WelcomeService = welcomeService
  ) {
    makeAutoObservable(this);
  }

  public get name(): string {
    return this._name;
  }

  public get introduce(): string {
    return this._introduce;
  }

  public get tags(): string {
    return this._tags;
  }

  public get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  public get successToCreate(): boolean {
    return this._successToCreate;
  }

  public get profileImageUrlErrorMessage(): string | undefined {
    if (!this._profileImageChanged) {
      return undefined;
    }
    try {
      if (this._profileImage) {
        validateUserProfileImage(this._profileImage);
      }
    } catch (e) {
      if (typeof e === "string") {
        return e;
      }
    }
    return undefined;
  }

  public get nameErrorMessage(): string | undefined {
    if (!this._nameChanged) {
      return undefined;
    }
    try {
      validateUserName(this._name);
    } catch (e) {
      if (typeof e === "string") {
        return e;
      }
    }
    return undefined;
  }

  public get introduceErrorMessage(): string | undefined {
    if (!this._introduceChanged) {
      return undefined;
    }
    try {
      validateUserIntroduce(this._introduce);
    } catch (e) {
      if (typeof e === "string") {
        return e;
      }
    }
    return undefined;
  }

  public get tagsErrorMessage(): string | undefined {
    if (!this._tagsChanged) {
      return undefined;
    }
    try {
      validateUserTags(this._tags.split(" "));
    } catch (e) {
      if (typeof e === "string") {
        return e;
      }
    }
    return undefined;
  }

  public changeProfileImage(file: File) {
    this._profileImageChanged = true;
    this._profileImage = file;
  }

  public changeName(name: string) {
    this._nameChanged = true;
    this._name = name;
  }

  public changeIntroduce(introduce: string) {
    this._introduceChanged = true;
    this._introduce = introduce;
  }

  public changeTags(tags: string) {
    this._tagsChanged = true;
    this._tags = tags;
  }

  public createUser = async (uid: string) => {
    const createUserResult = await this._userService.createUser(
      uid,
      this._name,
      this._introduce,
      this._tags.split(" ")
    );
    if (createUserResult.isSuccess) {
      if (this._profileImageChanged && this._profileImage != null) {
        const formData = new FormData();
        formData.append("fileName", uid);
        formData.append("profileImage", this._profileImage);

        const uploadProfileImageResult =
          await this._userService.uploadProfileImage(uid, formData);
        if (uploadProfileImageResult.isSuccess) {
          this._successToCreate = true;
        } else {
          this._errorMessage =
            uploadProfileImageResult.throwableOrNull()!!.message;
          return;
        }
      } else {
        this._successToCreate = true;
      }
      // TODO: 회원가입 후 유저 정보를 가지고 올 수 없다. 따라서 유저 생성이 성공이라면 유저정보를 가지고 오게 설정했다. 다른 방법 생각해볼 것
      await userStore.fetchAuth();
    } else {
      this._errorMessage = createUserResult.throwableOrNull()!!.message;
    }
  };

  public async onChangeTagInput(tag: string) {
    this._tag = tag;
    if (this._tag === "") {
      this._recommendTags = [];
      return;
    }
    const result = await this._welcomeService.getTags(this._tag);
    if (result.isSuccess) {
      runInAction(() => {
        this._errorMessage = undefined;
        this.setRecommendTags(result.getOrNull()!!);
      });
    } else {
      runInAction(() => {
        this._successMessage = undefined;
        this._errorMessage = result.throwableOrNull()!.message;
      });
    }
  }

  private setRecommendTags(tags: Tag[]) {
    this._recommendTags = tags;
  }
}
