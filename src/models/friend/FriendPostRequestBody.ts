import { validateUid, validateUserName } from "@/utils/user.validator";

export class FriendPostRequestBody {
  constructor(readonly userName: string, readonly userId: string) {
    this._validateUserName();
    this._validateUserId();
  }
  private _validateUserName() {
    validateUserName(this.userName);
  }

  private _validateUserId() {
    validateUid(this.userId);
  }
}
