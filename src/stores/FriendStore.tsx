import { RootStore } from "@/stores/RootStore";
import friendService, { FriendService } from "@/service/Friend.service";
import userStore from "@/stores/UserStore";
import { makeAutoObservable, runInAction } from "mobx";
import {
  APPROVE_FRIEND_REQUEST_SUCCESS,
  REFUSE_FRIEND_REQUEST_SUCCESS,
  FRIEND_REQUEST_REFUSE_SUCCESS,
  FRIEND_REQUEST_SUCCESS,
  FRIEND_REQUESTS_GET_SUCCESS,
  SEARCH_SIMILAR_NAMED_USERS_SUCCESS,
  FRIEND_LIST_GET_SUCCESS,
} from "@/constants/FriendMessage";
import { UserSearchOverview } from "@/models/user/UserSearchOverview";
import { NO_USER_STORE_ERROR_MESSAGE } from "@/constants/message";
import { friendStatus } from "@/constants/FriendStatus";
import { FriendRequestUser } from "@/models/friend/FriendRequestUser";
import { UserOverview } from "@/models/user/UserOverview";

export class FriendStore {
  readonly rootStore: RootStore;
  private _userSearchOverviews: UserSearchOverview[] = [];
  private _friendRequestUsers: FriendRequestUser[] = [];
  private _friendOverviews: UserOverview[] = [];
  private _friendRequestInput: string | undefined = undefined;
  private _errorMessage: string | undefined = undefined;
  private _successMessage: string | undefined = undefined;
  constructor(
    root: RootStore,
    private readonly _friendService: FriendService = friendService
  ) {
    this.rootStore = root;
    makeAutoObservable(this);
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

  public get friendRequestUsers() {
    return this._friendRequestUsers;
  }

  public get friendOverviews() {
    return this._friendOverviews;
  }

  public async changeFriendRequestInput(str: string) {
    this._friendRequestInput = str;
  }

  public findIndexFromUserOverview(userId: string) {
    return this.userSearchOverviews.findIndex(
      (overview) => overview.id === userId
    );
  }

  private _changeAcceptedToRequested(userId: string) {
    const index = this.findIndexFromUserOverview(userId);
    this._userSearchOverviews[index] = {
      ...this._userSearchOverviews[index],
      requestHistory: friendStatus.REQUESTED,
    };
  }

  private _changeAcceptedToNone(userId: string) {
    const index = this.findIndexFromUserOverview(userId);
    this._userSearchOverviews[index] = {
      ...this._userSearchOverviews[index],
      requestHistory: friendStatus.NONE,
    };
  }

  private _disposeFriendRequest(userId: string) {
    this._friendRequestUsers = this._friendRequestUsers!.filter(
      (item) => item.requesterId !== userId
    );
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
      //유저 정보가 존재하지 않을 경우 에러 처리
      if (!userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const requesterId = userStore.currentUser.id;
      const result = await this._friendService.sendFriendRequest(
        requesterId,
        userId
      );
      if (result.isSuccess) {
        runInAction(() => {
          this._errorMessage = undefined;
          this._successMessage = FRIEND_REQUEST_SUCCESS;
          this._changeAcceptedToRequested(userId);
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

  public async cancelFriendRequest(userId: string) {
    try {
      //유저 정보가 존재하지 않을 경우 에러 처리
      if (!userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const requesterId = userStore.currentUser.id;
      const result = await this._friendService.deleteFriendRequest(
        requesterId,
        userId
      );
      if (result.isSuccess) {
        runInAction(() => {
          this._errorMessage = undefined;
          this._successMessage = REFUSE_FRIEND_REQUEST_SUCCESS;
          this._changeAcceptedToNone(userId);
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

  public async fetchFriendRequests() {
    try {
      //유저 정보가 존재하지 않을 경우 에러 처리
      if (!userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const requesterId = userStore.currentUser.id;
      const result = await this._friendService.getFriendRequests(requesterId);
      if (result.isSuccess) {
        runInAction(() => {
          this._errorMessage = undefined;
          this._successMessage = FRIEND_REQUESTS_GET_SUCCESS;
          this._friendRequestUsers = result.getOrNull()!;
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

  public async fetchFriendList() {
    try {
      //유저 정보가 존재하지 않을 경우 에러 처리
      if (!userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const requesterId = userStore.currentUser.id;
      const result = await this._friendService.getFriendList(requesterId);
      if (result.isSuccess) {
        runInAction(() => {
          this._errorMessage = undefined;
          this._successMessage = FRIEND_LIST_GET_SUCCESS;
          this._friendOverviews = result.getOrNull()!;
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

  public async acceptFriendRequest(userId: string) {
    try {
      //유저 정보가 존재하지 않을 경우 에러 처리
      if (!userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const accepterId = userStore.currentUser.id;
      const result = await this._friendService.acceptFriendRequest(
        userId,
        accepterId
      );
      if (result.isSuccess) {
        runInAction(() => {
          this._errorMessage = undefined;
          this._successMessage = APPROVE_FRIEND_REQUEST_SUCCESS;
          this._disposeFriendRequest(userId);
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

  public async refuseFriendRequest(userId: string) {
    try {
      //유저 정보가 존재하지 않을 경우 에러 처리
      if (!userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const accepterId = userStore.currentUser.id;
      const result = await this._friendService.deleteFriendRequest(
        userId,
        accepterId
      );
      if (result.isSuccess) {
        runInAction(() => {
          this._errorMessage = undefined;
          this._successMessage = FRIEND_REQUEST_REFUSE_SUCCESS;
          this._disposeFriendRequest(userId);
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
}
