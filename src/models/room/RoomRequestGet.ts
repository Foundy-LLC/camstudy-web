import { validatePageNum } from "@/utils/rooms.validator";
import { NO_USER_UID_ERROR_MESSAGE } from "@/constants/message";

export class RoomRequestGet {
  readonly pageNum: number;
  constructor(readonly page: string | string[] | undefined) {
    this._validatePage();
    this.pageNum = this._convertPageToInt(page);
    this._validatePageNum();
  }
  private _validatePage = () => {
    if (this.page == null) {
      throw NO_USER_UID_ERROR_MESSAGE;
    }
  };
  private _convertPageToInt = (page: string | string[] | undefined): number => {
    return typeof page === "string" ? parseInt(page) : 0;
  };
  private _validatePageNum = () => {
    validatePageNum(this.pageNum);
  };
}
