import { makeAutoObservable } from "mobx";
import userService, { UserService } from "@/service/user.service";
import {
  validateUserIntroduce,
  validateUserName,
  validateUserTags,
} from "@/utils/user.validator";

export class WelcomeStore {
  private _name: string = "";
  private _introduce: string = "";
  private _tags: string = "";

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
  };
}
