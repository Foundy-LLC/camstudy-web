import { RootStore } from "@/stores/RootStore";
import friendService, { FriendService } from "@/service/Friend.service";
import userStore from "@/stores/UserStore";
import { makeAutoObservable, runInAction } from "mobx";
import {
  FRIEND_REQUEST_SUCCESS,
  SEARCH_SIMILAR_NAMED_USERS_SUCCESS,
} from "@/constants/FriendMessage";

export interface UserSearchOverview {
  id: string;
  name: string;
  profile_image: string | null;
}
export class FriendStore {
  readonly rootStore: RootStore;
  private _userSearchOverview: UserSearchOverview[] = [];
  private _friendRequestInput: string | undefined = undefined;
  private _selectedUserId: string | undefined = undefined;
  private _errorMessage: string | undefined = undefined;
  private _successMessage: string | undefined = undefined;
  constructor(
    root: RootStore,
    private readonly _friendService: FriendService = friendService
  ) {
    makeAutoObservable(this);
    this.rootStore = root;
  }
  public get friendRequestInput() {
    return this._friendRequestInput;
  }

  public get errorMessage() {
    return this._errorMessage;
  }

  public get successMessage() {
    return this._successMessage;
  }

  public get userSearchOverview() {
    return this._userSearchOverview;
  }

  public async changeFriendRequestInput(str: string) {
    this._friendRequestInput = str;
  }

  public async getSimilarNamedUsers() {
    if (!this._friendRequestInput) return;
    const result = await this._friendService.getSimilarNamedUsers(
      this._friendRequestInput
    );
    if (result.isSuccess) {
      runInAction(() => {
        this._errorMessage = undefined;
        this._userSearchOverview = result.getOrNull()!;
        this._successMessage = SEARCH_SIMILAR_NAMED_USERS_SUCCESS;
      });
    } else {
      runInAction(() => {
        this._successMessage = undefined;
        this._errorMessage = result.throwableOrNull()!.message;
      });
    }
  }

  public async sendFriendRequest(userId: string) {
    this._selectedUserId = userId;
    if (!this._selectedUserId) return;

    const result = await this._friendService.sendFriendRequest(
      this._selectedUserId,
      userStore.currentUser?.id!
    );
    if (result.isSuccess) {
      runInAction(() => {
        this._errorMessage = undefined;
        this._successMessage = FRIEND_REQUEST_SUCCESS;
      });
    } else {
      runInAction(() => {
        this._successMessage = undefined;
        this._errorMessage = result.throwableOrNull()!.message;
      });
    }
  }
}
