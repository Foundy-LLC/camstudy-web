import { validateUid } from "@/utils/user.validator";
import {
  validateAccepted,
  validateAcceptedBoolean,
} from "@/utils/friend.validator";

export class FriendRequestsGetBody {
  readonly page: number;

  constructor(readonly userId: string, page: string | undefined) {
    page ??= "0";
    this._validateUserIds();
    this.page = parseInt(page);
  }

  private _validateUserIds() {
    validateUid(this.userId);
  }
}
