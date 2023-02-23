import { validateAccessToken } from "@/utils/organizations.validator";

export class OrganizationsEmailJWTBody {
  constructor(readonly AccessToken: string) {
    this._validateAccessToken();
  }

  private _validateAccessToken = () => {
    validateAccessToken(this.AccessToken);
  };
}
