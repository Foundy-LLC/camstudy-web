import { validatePage } from "@/utils/rooms.validator";
import {
  validateOrganizationsPage,
  validateOrganizationsPageNum,
} from "@/utils/organizations.validator";

export class OrganizationsGetRequestBody {
  readonly pageNum: number;
  constructor(readonly page: string, readonly name?: string) {
    this._validatePage();
    this.pageNum = this._convertPageToInt(page);
    this._validatePageNum();
  }
  private _validatePage = () => {
    validateOrganizationsPage(this.page);
  };
  private _convertPageToInt = (page: string): number => {
    return parseInt(page);
  };
  private _validatePageNum = () => {
    validateOrganizationsPageNum(this.pageNum);
  };
}
