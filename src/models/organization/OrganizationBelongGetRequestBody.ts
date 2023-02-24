import { validateUid } from "@/utils/user.validator";

export class OrganizationBelongGetRequestBody {
  constructor(readonly userId: string) {
    this._validateUserId();
  }
  private _validateUserId = () => {
    validateUid(this.userId);
  };
}
