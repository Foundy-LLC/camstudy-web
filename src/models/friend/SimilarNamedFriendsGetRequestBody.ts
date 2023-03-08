import { validateUid, validateUserName } from "@/utils/user.validator";

export class SimilarNamedFriendsGetRequestBody {
  constructor(readonly userName: string, readonly userId: string) {
    this._validateUserName();
    this._validateUid();
  }
  private _validateUserName() {
    validateUserName(this.userName);
  }
  private _validateUid() {
    validateUid(this.userId);
  }
}
