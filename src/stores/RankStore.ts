import { RootStore } from "@/stores/RootStore";
import { UserStore } from "@/stores/UserStore";
import profileService, { ProfileService } from "@/service/profile.service";
import { makeAutoObservable, runInAction } from "mobx";
import rankService, { RankService } from "@/service/rank.service";
import { NO_USER_STORE_ERROR_MESSAGE } from "@/constants/message";
import { UserRankingOverview } from "@/models/rank/UserRankingOverview";
import { FRIEND_NUM_PER_PAGE } from "@/constants/friend.constant";

export class RankStore {
  readonly rootStore: RootStore;
  readonly userStore: UserStore;
  private _selectedOrganizationId?: string;
  private _pageNum: number = 0;
  private _isWeeklyRank: boolean = false;
  private _errorMessage: string = "";
  private _successMessage: string = "";
  private _rankList?: UserRankingOverview[] = undefined;
  private _rankMaxPage?: number = undefined;

  constructor(
    root: RootStore,
    private readonly _rankService: RankService = rankService
  ) {
    makeAutoObservable(this);
    this.rootStore = root;
    this.userStore = root.userStore;
  }

  public get errorMessage() {
    return this._errorMessage;
  }

  public get successMessage() {
    return this._successMessage;
  }

  public get rankList() {
    return this._rankList;
  }

  public get rankMaxPage() {
    return this._rankMaxPage;
  }

  public getRank = async () => {
    try {
      if (!this.userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const result = await this._rankService.getRank(
        this._selectedOrganizationId,
        this._pageNum,
        this._isWeeklyRank
      );
      if (result.isSuccess) {
        runInAction(() => {
          const { totalUserCount, users } = result.getOrNull();
          this._rankList = users;
          this._rankMaxPage =
            totalUserCount % 50 === 0
              ? Math.floor(totalUserCount / 50)
              : Math.floor(totalUserCount / 50) + 1;
        });
      } else {
      }
    } catch (e) {
      runInAction(() => {
        if (e instanceof Error) this._errorMessage = e.message;
      });
    }
  };
}
