import { RootStore } from "@/stores/RootStore";
import { UserStore } from "@/stores/UserStore";
import profileService, { ProfileService } from "@/service/profile.service";
import { makeAutoObservable } from "mobx";
import rankService, { RankService } from "@/service/rank.service";
import { NO_USER_STORE_ERROR_MESSAGE } from "@/constants/message";

export class RankStore {
  readonly rootStore: RootStore;
  readonly userStore: UserStore;
  private _selectedOrganizationId?: string;
  private _pageNum: number = 0;
  private _isWeeklyRank: boolean = false;

  constructor(
    root: RootStore,
    private readonly _rankService: RankService = rankService
  ) {
    makeAutoObservable(this);
    this.rootStore = root;
    this.userStore = root.userStore;
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
      console.log(result);
    } catch (e) {}
  };
}
