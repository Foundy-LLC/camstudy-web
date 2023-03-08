import { RootStore } from "@/stores/RootStore";
import friendService, { FriendService } from "@/service/Friend.service";
import userStore from "@/stores/UserStore";
import { makeAutoObservable, runInAction } from "mobx";
import {
  FRIEND_REQUEST_SUCCESS,
  NO_SELECTED_USER_FOR_FRIEND_REQUEST,
  SEARCH_SIMILAR_NAMED_USERS_SUCCESS,
} from "@/constants/FriendMessage";
import { UserSearchOverview } from "@/models/user/UserSearchOverview";
import { NO_USER_STORE_ERROR_MESSAGE } from "@/constants/message";
import { element } from "prop-types";
import { friendStatus } from "@/constants/FriendStatus";

export class FriendStore {
  readonly rootStore: RootStore;
  private _userSearchOverviews: UserSearchOverview[] = [];
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

  public get errorMessage() {
    return this._errorMessage;
  }

  public get successMessage() {
    return this._successMessage;
  }

  public get userSearchOverviews() {
    return this._userSearchOverviews;
  }

  public async changeFriendRequestInput(str: string) {
    this._friendRequestInput = str;
  }

  public findIndexFromUserOverview(userId: string) {
    return this.userSearchOverviews.findIndex(
      (overview) => overview.id === userId
    );
  }

  private _pushAcceptedToUserOverview(userId: string) {
    const index = this.findIndexFromUserOverview(userId);
    this._userSearchOverviews[index] = {
      ...this._userSearchOverviews[index],
      requestHistory: friendStatus.REQUESTED,
    };
  }

  public async getSimilarNamedUsers() {
    if (!this._friendRequestInput) return;
    if (!userStore.currentUser) {
      throw new Error(NO_USER_STORE_ERROR_MESSAGE);
    }
    const userId = userStore.currentUser.id;
    const result = await this._friendService.getSimilarNamedUsers(
      this._friendRequestInput,
      userId
    );
    if (result.isSuccess) {
      runInAction(() => {
        this._errorMessage = undefined;
        this._userSearchOverviews = result.getOrNull()!;
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
    try {
      this._selectedUserId = userId;
      //유저 정보가 존재하지 않을 경우 에러 처리
      if (!userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const requesterId = userStore.currentUser.id;
      //선택된 유저가 존재하지 않을 경우 에러
      if (!this._selectedUserId) {
        throw new Error(NO_SELECTED_USER_FOR_FRIEND_REQUEST);
      }
      const result = await this._friendService.sendFriendRequest(
        requesterId,
        this._selectedUserId
      );
      if (result.isSuccess) {
        runInAction(() => {
          this._errorMessage = undefined;
          this._successMessage = FRIEND_REQUEST_SUCCESS;
          this._pushAcceptedToUserOverview(userId);
        });
      } else {
        runInAction(() => {
          this._successMessage = undefined;
          throw new Error(result.throwableOrNull()!.message);
        });
      }
    } catch (e) {
      runInAction(() => {
        if (e instanceof Error) this._errorMessage = e.message;
      });
    }
  }

  public async cancelFriendRequest(userId: string) {}
}
