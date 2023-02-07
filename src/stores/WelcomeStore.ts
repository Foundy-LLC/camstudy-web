import { makeAutoObservable } from "mobx";
import userService, { UserService } from "@/service/user.service";
import {
  validateUserProfileImage,
  validateUserIntroduce,
  validateUserName,
  validateUserTags,
} from "@/utils/user.validator";

export class WelcomeStore {
  private _profileImage?: File;
  private _name: string = "";
  private _introduce: string = "";
  private _tags: string = "";

  private _profileImageUrlChanged: boolean = false;
  private _nameChanged: boolean = false;
  private _introduceChanged: boolean = false;
  private _tagsChanged: boolean = false;

  private _errorMessage?: string = undefined;
  private _successToCreate: boolean = false;

  constructor(private readonly _userService: UserService = userService) {
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
    if (!this._profileImageUrlChanged) {
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
    this._profileImageUrlChanged = true;
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
    const result = await this._userService.createUser(
      uid,
      this._name,
      this._introduce,
      this._tags.split(" ")
    );
    if (result.isSuccess) {
      this._successToCreate = true;
    } else {
      this._errorMessage = result.throwableOrNull()!!.message;
    }

    if (this._profileImageUrlChanged && this._profileImage != null) {
      const formData = new FormData();
      formData.append("fileName", uid);
      formData.append("profileImage", this._profileImage);

      const response = await this._userService.uploadProfileImage(
        uid,
        formData
      );
      console.log(response);
    }
  };
}
