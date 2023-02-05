import { NO_USER_UID_ERROR_MESSAGE } from "@/constants/message";

export class InitialInformationRequestBody {
  constructor(readonly userId: string) {
    this._validateUid();
  }

  private _validateUid = () => {
    if (this.userId == null) {
      throw NO_USER_UID_ERROR_MESSAGE;
    }
  };
}
