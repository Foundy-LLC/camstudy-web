import { validatePage, validatePageNum } from "@/utils/rooms.validator";
import { NO_USER_UID_ERROR_MESSAGE } from "@/constants/message";
import { validateUid } from "@/utils/user.validator";

export class RecentRoomsGetRequest {
  constructor(readonly userId: string) {
    this._validateUserId();
  }
  private _validateUserId = () => {
    validateUid(this.userId);
  };
}
