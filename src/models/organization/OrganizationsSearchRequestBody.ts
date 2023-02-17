import { validatePageNum } from "@/utils/rooms.validator";
import { validateOrganizationName } from "@/utils/organizations.validator";

export class OrganizationsSearchRequestBody {
  constructor(readonly name: string) {
    this._validateOrganizationName();
  }
  private _validateOrganizationName = () => {
    validateOrganizationName(this.name);
  };
}
