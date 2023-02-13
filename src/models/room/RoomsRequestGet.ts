import { validatePageNum } from "@/utils/rooms.validator";
import { NO_USER_UID_ERROR_MESSAGE } from "@/constants/message";

//TODO(건우): joinCount가 maxCount를 넘지 않는지 검사 추가 필요
export class RoomsRequestGet {
  readonly pageNum: number;
  constructor(readonly page: string) {
    this._validatePage();
    this.pageNum = this._convertPageToInt(page);
    this._validatePageNum();
  }
  private _validatePage = () => {
    if (this.page == null) {
      throw NO_USER_UID_ERROR_MESSAGE;
    }
  };
  private _convertPageToInt = (page: string): number => {
    return parseInt(page);
  };
  private _validatePageNum = () => {
    validatePageNum(this.pageNum);
  };
}
