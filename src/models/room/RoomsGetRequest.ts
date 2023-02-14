import { validatePage, validatePageNum } from "@/utils/rooms.validator";
import { NO_USER_UID_ERROR_MESSAGE } from "@/constants/message";

export class RoomsGetRequest {
  readonly pageNum: number;
  constructor(readonly page: string) {
    this._validatePage();
    this.pageNum = this._convertPageToInt(page);
    this._validatePageNum();
  }
  private _validatePage = () => {
    validatePage(this.page);
  };
  private _convertPageToInt = (page: string): number => {
    return parseInt(page);
  };
  private _validatePageNum = () => {
    validatePageNum(this.pageNum);
  };
}
