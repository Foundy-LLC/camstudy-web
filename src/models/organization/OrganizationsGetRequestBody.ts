import { validatePage } from "@/utils/rooms.validator";
import { validateOrganizationsPageNum } from "@/utils/organizations.validator";

export class OrganizationsGetRequestBody {
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
    validateOrganizationsPageNum(this.pageNum);
  };
}
