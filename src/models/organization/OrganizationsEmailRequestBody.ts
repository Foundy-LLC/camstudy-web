import {
  validateEmail,
  validateOrganizationId,
} from "@/utils/organizations.validator";
import { validateUid, validateUserName } from "@/utils/user.validator";

export class OrganizationsEmailRequestBody {
  constructor(
    readonly userId: string,
    readonly userName: string,
    readonly email: string,
    readonly organizationId: string
  ) {
    this._validateUserId();
    this._validateUserName();
    this._validateEmail();
    this._validateOrganizationId();
  }
  private _validateUserId = () => {
    validateUid(this.userId);
  };

  private _validateUserName = () => {
    validateUserName(this.userName);
  };
  private _validateEmail = () => {
    validateEmail(this.email);
  };
  private _validateOrganizationId = () => {
    validateOrganizationId(this.organizationId);
  };
}
