import { validateUid } from "@/utils/user.validator";
import { validateOrganizationId } from "@/utils/organizations.validator";

export class OrganizationsEmailConfirmBody {
  constructor(readonly userId: string, readonly organizationId: string) {
    this._validateUserId();
    this._validateOrganizationId();
  }

  private _validateUserId = () => {
    validateUid(this.userId);
  };

  private _validateOrganizationId = () => {
    validateOrganizationId(this.organizationId);
  };
}
