import { validateUid } from "@/utils/user.validator";
import {
  validateAccepted,
  validateAcceptedBoolean,
} from "@/utils/friend.validator";

export class FriendGetRequestsBody {
  private readonly _accepted: boolean | undefined;

  constructor(readonly userId: string, accepted: string) {
    this._validateUserIds();
    validateAccepted(accepted);
    this._accepted = this._convertAcceptedToBoolean(accepted);
    this._validateAccepted();
  }

  public get accepted() {
    return this._accepted;
  }

  private _validateUserIds() {
    validateUid(this.userId);
  }

  private _convertAcceptedToBoolean = (accepted: string): boolean => {
    return accepted === "true" ? true : false;
  };

  private _validateAccepted() {
    validateAcceptedBoolean(this._accepted);
  }
}
