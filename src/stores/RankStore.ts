import { RootStore } from "@/stores/RootStore";
import { UserStore } from "@/stores/UserStore";
import { makeAutoObservable, runInAction } from "mobx";
import rankService, { RankService } from "@/service/rank.service";
import { UserRankingOverview } from "@/models/rank/UserRankingOverview";
import { RANKING_NUM_PER_PAGE } from "@/constants/rank.constant";

export class RankStore {
  readonly rootStore: RootStore;
  readonly userStore: UserStore;
  private _selectedOrganizationId?: string;
  private _pageNum: number = 0;
  private _isWeeklyRank: boolean = false;
  private _errorMessage: string = "";
  private _successMessage: string = "";
  private _rankList?: UserRankingOverview[] = undefined;
  private _userTotalRank?: UserRankingOverview = undefined;
  private _userWeekRank?: UserRankingOverview = undefined;
  private _myTotalRank?: UserRankingOverview = undefined;
  private _myWeekRank?: UserRankingOverview = undefined;
  private _rankMaxPage?: number = undefined;
  private _totalUserCount?: number = undefined;
  private _weeklyUserCount?: number = undefined;
  private _totalPercentile?: string = undefined;

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

  public get userTotalRank() {
    return this._userTotalRank;
  }

  public get userWeekRank() {
    return this._userWeekRank;
  }

  public get myTotalRank() {
    return this._myTotalRank;
  }

  public get myWeekRank() {
    return this._myWeekRank;
  }

  public get rankMaxPage() {
    return this._rankMaxPage;
  }

  public get isWeeklyRank() {
    return this._isWeeklyRank;
  }

  public get totalUserCount() {
    return this._totalUserCount;
  }

  public get weeklyUserCount() {
    return this._weeklyUserCount;
  }

  public get totalPercentile() {
    return this._totalPercentile;
  }

  public setIsWeekly = (isWeekly: boolean) => {
    this._isWeeklyRank = isWeekly;
  };

  public setSelectedOrganizationId = (organizationId: string | undefined) => {
    this._selectedOrganizationId = organizationId;
  };

  public getRank = async () => {
    try {
      const result = await this._rankService.getRank(
        this._selectedOrganizationId,
        this._pageNum,
        this._isWeeklyRank
      );
      if (result.isSuccess) {
        runInAction(() => {
          const { totalUserCount, users } = result.getOrNull()!;
          this._rankList = users;
          this._totalUserCount = Number(totalUserCount);
          this._rankMaxPage =
            Number(totalUserCount) % RANKING_NUM_PER_PAGE === 0
              ? Math.floor(Number(totalUserCount) / RANKING_NUM_PER_PAGE)
              : Math.floor(Number(totalUserCount) / RANKING_NUM_PER_PAGE) + 1;
        });
      } else {
        runInAction(() => {
          this._errorMessage = result.throwableOrNull()!.message;
        });
      }
    } catch (e) {
      runInAction(() => {
        if (e instanceof Error) this._errorMessage = e.message;
      });
    }
  };

  public getUserTotalRank = async (userId: string) => {
    try {
      if (!this.userStore.currentUser) return;
      const result = await this._rankService.getUserRank(
        userId,
        this._selectedOrganizationId,
        false
      );
      if (result.isSuccess) {
        runInAction(() => {
          const { totalUserCount, users } = result.getOrNull()!;
          if (userId === this.userStore.currentUser!.id) {
            this._myTotalRank = users;
            this._userTotalRank = users;
          } else {
            this._userTotalRank = users;
          }
          this._totalUserCount = Number(totalUserCount);
          this._rankMaxPage =
            Number(totalUserCount) % RANKING_NUM_PER_PAGE === 0
              ? Math.floor(Number(totalUserCount) / RANKING_NUM_PER_PAGE)
              : Math.floor(Number(totalUserCount) / RANKING_NUM_PER_PAGE) + 1;
        });
      } else {
        runInAction(() => {
          this._errorMessage = result.throwableOrNull()!.message;
        });
      }
    } catch (e) {
      runInAction(() => {
        if (e instanceof Error) this._errorMessage = e.message;
      });
    }
  };

  public getUserWeeklyRank = async (userId: string) => {
    try {
      if (!this.userStore.currentUser) return;
      const result = await this._rankService.getUserRank(
        userId,
        this._selectedOrganizationId,
        true
      );
      if (result.isSuccess) {
        runInAction(() => {
          const { totalUserCount, users } = result.getOrNull()!;
          if (userId === this.userStore.currentUser!.id) {
            this._myWeekRank = users;
            this._userWeekRank = users;
          } else {
            this._userWeekRank = users;
          }
          this._weeklyUserCount = Number(totalUserCount);
          if (users.ranking) {
            this._totalPercentile = (
              (1 -
                (this._weeklyUserCount - users.ranking) /
                  this._weeklyUserCount) *
              100
            ).toFixed(1);
          } else {
            this._totalPercentile = "--";
          }
          this._rankMaxPage =
            Number(totalUserCount) % RANKING_NUM_PER_PAGE === 0
              ? Math.floor(Number(totalUserCount) / RANKING_NUM_PER_PAGE)
              : Math.floor(Number(totalUserCount) / RANKING_NUM_PER_PAGE) + 1;
        });
      } else {
        runInAction(() => {
          this._errorMessage = result.throwableOrNull()!.message;
        });
      }
    } catch (e) {
      runInAction(() => {
        if (e instanceof Error) this._errorMessage = e.message;
      });
    }
  };
}
