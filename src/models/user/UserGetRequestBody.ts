import { NO_USER_UID_ERROR_MESSAGE } from "@/constants/message";
//TODO: 클래스명 바꾸기
export class UserGetRequestBody {
  constructor(readonly userId: string) {
    this._validateUid();
  }

  private _validateUid = () => {
    if (this.userId == null) {
      throw NO_USER_UID_ERROR_MESSAGE;
    }
  };
}
