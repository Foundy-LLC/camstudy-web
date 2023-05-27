import { RootStore } from "@/stores/RootStore";
import friendService, { FriendService } from "@/service/friend.service";
import { UserStore } from "@/stores/UserStore";
import { action, makeAutoObservable, runInAction } from "mobx";
import {
  APPROVE_FRIEND_REQUEST_SUCCESS,
  FREIND_DELETE_SUCCESS,
  FRIEND_LIST_GET_SUCCESS,
  FRIEND_REQUEST_REFUSE_SUCCESS,
  FRIEND_REQUEST_SUCCESS,
  FRIEND_REQUESTS_GET_SUCCESS,
  REFUSE_FRIEND_REQUEST_SUCCESS,
  SEARCH_SIMILAR_NAMED_USERS_SUCCESS,
  USER_SEARCH_RESULT_NULL,
} from "@/constants/FriendMessage";
import { UserSearchOverview } from "@/models/user/UserSearchOverview";
import {
  NO_USER_STORE_ERROR_MESSAGE,
  RECOMMENDED_FREINDS_GET_SUCCESS,
} from "@/constants/message";
import { friendStatus } from "@/constants/FriendStatus";
import { UserOverview } from "@/models/user/UserOverview";
import { FRIEND_NUM_PER_PAGE } from "@/constants/friend.constant";
import { ProfileStore } from "@/stores/ProfileStore";

export class FriendStore {
  readonly rootStore: RootStore;
  private _userStore: UserStore;
  private _profileStore: ProfileStore;
  private _userSearchOverviews: UserSearchOverview[] = [];
  private _friendRequestUsers: UserOverview[] = [];
  private _friendOverviews: UserOverview[] = [];
  private _recommendedFriendOverviews: UserOverview[] = [];
  private _searchUserInput: string | undefined = undefined;
  private _errorMessage: string | undefined = undefined;
  private _searchErrorMessage: string | undefined = USER_SEARCH_RESULT_NULL;
  private _successMessage: string | undefined = undefined;
  private _friendListMaxPage: number = -1;
  private _userListMaxPage: number = -1;
  private _searchFriendMaxPage: number | undefined = undefined;
  constructor(
    root: RootStore,
    private readonly _friendService: FriendService = friendService
  ) {
    makeAutoObservable(this);
    this.rootStore = root;
    this._userStore = root.userStore;
    this._profileStore = root.profileStore;
  }

  public get friendListMaxPage() {
    return this._friendListMaxPage;
  }

  public get searchFriendMaxPage() {
    return this._searchFriendMaxPage;
  }

  public get searchErrorMessage() {
    return this._searchErrorMessage;
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

  public get recommendedFriendOverviews() {
    return this._recommendedFriendOverviews;
  }

  public get friendRequestUsers() {
    return this._friendRequestUsers;
  }

  public get friendOverviews() {
    return this._friendOverviews;
  }

  public changeSearchUserInput(str: string) {
    console.log(str);
    this._searchUserInput = str;
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

  public async findUserByName() {
    if (!this._searchUserInput) {
      this._userSearchOverviews = [];
      this._searchErrorMessage = USER_SEARCH_RESULT_NULL;
      return;
    }
    if (!this._userStore.currentUser) {
      throw new Error(NO_USER_STORE_ERROR_MESSAGE);
    }
    const userId = this._userStore.currentUser.id;
    const result = await this._friendService.findUserByName(
      this._searchUserInput,
      userId
    );
    if (result.isSuccess) {
      runInAction(() => {
        this._errorMessage = undefined;
        const dataArray = result.getOrNull()!;
        console.log(dataArray);
        this._searchFriendMaxPage =
          Math.floor(dataArray.maxPage / FRIEND_NUM_PER_PAGE) + 1;
        this._userSearchOverviews = dataArray.users;
        this._successMessage = SEARCH_SIMILAR_NAMED_USERS_SUCCESS;
        if (dataArray.users.length === 0) {
          this._searchErrorMessage = USER_SEARCH_RESULT_NULL;
        } else {
          this._searchErrorMessage = undefined;
        }
      });
    } else {
      runInAction(() => {
        this._successMessage = undefined;
        this._searchErrorMessage = result.throwableOrNull()!.message;
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
          console.log("친구 전송 완료");
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
          console.log("친구 요청 취소 완료");
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

  public fetchFriendList = async (page: number) => {
    try {
      //유저 정보가 존재하지 않을 경우 에러 처리
      if (!this._userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const requesterId = this._userStore.currentUser.id;
      const result = await this._friendService.getFriendList(requesterId, page);
      if (result.isSuccess) {
        runInAction(() => {
          this._errorMessage = undefined;
          this._successMessage = FRIEND_LIST_GET_SUCCESS;
          const dataArray = result.getOrNull()!;
          this._friendListMaxPage =
            dataArray.maxPage % FRIEND_NUM_PER_PAGE === 0
              ? Math.floor(dataArray.maxPage / FRIEND_NUM_PER_PAGE)
              : Math.floor(dataArray.maxPage / FRIEND_NUM_PER_PAGE) + 1;
          this._friendOverviews = dataArray.friends;
          if (dataArray.friends.length === 0)
            this._errorMessage = "추가된 친구가 없습니다.";
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
  };

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
          const user = this._friendRequestUsers.filter(
            (user) => user.id === userId
          )[0];
          this._disposeFriendRequest(userId);
          this._friendOverviews.push(user);
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
          console.log("친구 취소 완료");
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

  public async fetchRecommendFriend(userId: string) {
    try {
      const result = await this._friendService.getRecommendFriend(userId);
      if (result.isSuccess) {
        runInAction(() => {
          this._errorMessage = undefined;
          this._successMessage = RECOMMENDED_FREINDS_GET_SUCCESS;
          this._recommendedFriendOverviews = result.getOrNull()!;
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
