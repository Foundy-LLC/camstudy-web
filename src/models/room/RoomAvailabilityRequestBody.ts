import { NO_USER_UID_ERROR_MESSAGE } from "@/constants/message";

export class RoomAvailabilityRequestBody {
  constructor(readonly userId: string, readonly password?: string) {
    this._validateUid();
  }

  private _validateUid = () => {
    if (this.userId == null) {
      throw NO_USER_UID_ERROR_MESSAGE;
    }
  };
}
