import { RootStore } from "@/stores/RootStore";
import friendService, { FriendService } from "@/service/Friend.service";
import { UserStore } from "@/stores/UserStore";
import { makeAutoObservable, runInAction } from "mobx";
import {
  APPROVE_FRIEND_REQUEST_SUCCESS,
  FREIND_DELETE_SUCCESS,
  FRIEND_LIST_GET_SUCCESS,
  FRIEND_REQUEST_REFUSE_SUCCESS,
  FRIEND_REQUEST_SUCCESS,
  FRIEND_REQUESTS_GET_SUCCESS,
  REFUSE_FRIEND_REQUEST_SUCCESS,
  SEARCH_SIMILAR_NAMED_USERS_SUCCESS,
} from "@/constants/FriendMessage";
import { UserSearchOverview } from "@/models/user/UserSearchOverview";
import { NO_USER_STORE_ERROR_MESSAGE } from "@/constants/message";
import { friendStatus } from "@/constants/FriendStatus";
import { FriendRequestUser } from "@/models/friend/FriendRequestUser";
import { UserOverview } from "@/models/user/UserOverview";

export class FriendStore {
  readonly rootStore: RootStore;
  private _userStore: UserStore;
  private _userSearchOverviews: UserSearchOverview[] = [];
  private _friendRequestUsers: UserOverview[] = [];
  private _friendOverviews: UserOverview[] = [];
  private _friendRequestInput: string | undefined = undefined;
  private _errorMessage: string | undefined = undefined;
  private _successMessage: string | undefined = undefined;
  private _friendListMaxPage: number | undefined = undefined;
  private _searchFriendMaxPage: number | undefined = undefined;
  constructor(
    root: RootStore,
    private readonly _friendService: FriendService = friendService
  ) {
    this.rootStore = root;
    this._userStore = root.userStore;
    makeAutoObservable(this);
  }

  public get friendListMaxPage() {
    return this._friendListMaxPage;
  }

  public get searchFriendMaxPage() {
    return this._searchFriendMaxPage;
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
      (item) => item.id !== userId
    );
  }

  private _reflectFriendDelete(userId: string) {
    this._friendOverviews = this._friendOverviews!.filter(
      (item) => item.id !== userId
    );
  }

  public async getSimilarNamedUsers() {
    if (!this._friendRequestInput) return;
    if (!this._userStore.currentUser) {
      throw new Error(NO_USER_STORE_ERROR_MESSAGE);
    }
    const userId = this._userStore.currentUser.id;
    const result = await this._friendService.getSimilarNamedUsers(
      this._friendRequestInput,
      userId
    );
    if (result.isSuccess) {
      runInAction(() => {
        this._errorMessage = undefined;
        const dataArray = result.getOrNull()!;
        this._searchFriendMaxPage = dataArray[0];
        this._userSearchOverviews = dataArray[1];
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
      if (!this._userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const requesterId = this._userStore.currentUser.id;
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
      if (!this._userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const requesterId = this._userStore.currentUser.id;
      const result = await this._friendService.deleteFriendOrRequest(
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
      if (!this._userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const requesterId = this._userStore.currentUser.id;
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
      if (!this._userStore.currentUser) {
        
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const requesterId = this._userStore.currentUser.id;
      const result = await this._friendService.getFriendList(requesterId);
      if (result.isSuccess) {
        runInAction(() => {
          this._errorMessage = undefined;
          this._successMessage = FRIEND_LIST_GET_SUCCESS;
          const dataArray = result.getOrNull()!;
          this._friendListMaxPage = dataArray[0];
          this._friendOverviews = dataArray[1];
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
      if (!this._userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const accepterId = this._userStore.currentUser.id;
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
      if (!this._userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const accepterId = this._userStore.currentUser.id;
      const result = await this._friendService.deleteFriendOrRequest(
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
  public async deleteFriend(userId: string) {
    try {
      //유저 정보가 존재하지 않을 경우 에러 처리
      if (!this._userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const accepterId = this._userStore.currentUser.id;
      const result = await this._friendService.deleteFriendOrRequest(
        userId,
        accepterId
      );
      if (result.isSuccess) {
        runInAction(() => {
          this._errorMessage = undefined;
          this._successMessage = FREIND_DELETE_SUCCESS;
          this._reflectFriendDelete(userId);
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
