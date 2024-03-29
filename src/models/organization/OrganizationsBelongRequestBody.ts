import { validateUid } from "@/utils/user.validator";
import {
  validateOrganizationId,
  validateOrganizationName,
} from "@/utils/organizations.validator";

export class OrganizationsBelongRequestBody {
  constructor(readonly userId: string, readonly organizationName: string) {
    this._validateUserId();
    this._validateOrganizationName();
  }

  private _validateUserId = () => {
    validateUid(this.userId);
  };

  private _validateOrganizationName = () => {
    validateOrganizationName(this.organizationName);
  };
}
