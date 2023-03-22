import { validateUid } from "@/utils/user.validator";
import { validatePage, validatePageNum } from "@/utils/rooms.validator";
import {
  validateAccepted,
  validateAcceptedBoolean,
} from "@/utils/friend.validator";

export class FriendGetOverviewsBody {
  private _pageNum: number | null;
  private _accepted: boolean | undefined;
  constructor(
    readonly userId: string,
    readonly page: string,
    accepted: string
  ) {
    this._validateUserIds();
    this._validatePage();
    this._pageNum = this._convertPageToInt(page);
    validateAccepted(accepted);
    this._accepted = this._convertAcceptedToBoolean(accepted);
    this._validatePagNum();
    this._validateAccepted();
  }

  public get pageNum() {
    return this._pageNum;
  }
  public get accepted() {
    return this._accepted;
  }
  private _validateUserIds() {
    validateUid(this.userId);
  }
  private _validatePage() {
    validatePage(this.page);
    this._pageNum = parseInt(this.page);
  }
  private _convertPageToInt = (page: string): number => {
    return parseInt(page);
  };

  private _convertAcceptedToBoolean = (accepted: string): boolean => {
    return accepted === "true" ? true : false;
  };
  private _validatePagNum() {
    validatePageNum(this._pageNum);
  }

  private _validateAccepted() {
    validateAcceptedBoolean(this._accepted);
  }
}
