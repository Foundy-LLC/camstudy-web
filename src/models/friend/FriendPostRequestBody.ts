import { validateUid } from "@/utils/user.validator";

export class FriendPostRequestBody {
  constructor(readonly userId: string, readonly targetUserId: string) {
    this._validateUserIds();
  }

  private _validateUserIds() {
    validateUid(this.userId);
    validateUid(this.targetUserId);
  }
}
