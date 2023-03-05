import { validateUid, validateUserName } from "@/utils/user.validator";

export class SimilarNamedFriendsGetRequestBody {
  constructor(readonly userName: string) {
    this._validateUserName();
  }
  private _validateUserName() {
    validateUserName(this.userName);
  }
}
