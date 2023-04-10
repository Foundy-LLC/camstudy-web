import { validatePage, validatePageNum } from "@/utils/rooms.validator";

export class RoomsGetRequest {
  readonly pageNum: number;
  constructor(page: string, readonly query: string | null) {
    this._validatePage(page);
    this.pageNum = this._convertPageToInt(page);
    this._validatePageNum();
  }
  private _validatePage = (page: string) => {
    validatePage(page);
  };
  private _convertPageToInt = (page: string): number => {
    return parseInt(page);
  };
  private _validatePageNum = () => {
    validatePageNum(this.pageNum);
  };
}
