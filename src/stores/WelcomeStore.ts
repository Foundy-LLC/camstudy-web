import { makeAutoObservable } from "mobx";
import userService, { UserService } from "@/service/user.service";
import { Room } from "@/stores/RoomListStore";
import RoomService from "@/service/room.service";

export class WelcomeStore {
  private _name: string = "";
  private _introduce: string = "";
  private _tags: string = "";
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

  public changeName(name: string) {
    this._name = name;
  }

  public changeIntroduce(introduce: string) {
    this._introduce = introduce;
  }

  public changeTags(tags: string) {
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
