import {
  convertPageToInt,
  validatePaginationPage,
  validatePaginationPageNum,
} from "@/utils/pagenation.validation";

export class OrganizationsGetRequestBody {
  readonly pageNum: number;

  constructor(readonly page: string, readonly name?: string) {
    this._validatePage();
    this.pageNum = convertPageToInt(page);
    this._validatePageNum();
  }

  private _validatePage = () => {
    validatePaginationPage(this.page);
  };
  private _validatePageNum = () => {
    validatePaginationPageNum(this.pageNum);
  };
}
