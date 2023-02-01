import {
  INTRODUCE_LENGTH_ERROR_MESSAGE,
  NAME_LENGTH_ERROR_MESSAGE,
  NO_NAME_ERROR_MESSAGE,
  NO_TAG_ERROR_MESSAGE,
  NO_UID_ERROR_MESSAGE,
  TAG_LENGTH_ERROR_MESSAGE,
} from "@/constants/message";
import {
  validateUserIntroduce,
  validateUserName,
  validateUserTags,
} from "@/utils/user.validator";

export class UserRequestBody {
  constructor(
    readonly userId: string,
    readonly name: string,
    readonly introduce: string | undefined,
    readonly tags: string[]
  ) {
    this._validateUid();
    this._validateName();
    this._validateIntroduce();
    this.tags = this._filterNotEmptyTags(tags);
    this._validateTags();
  }

  private _validateUid = () => {
    if (this.userId == null) {
      throw NO_UID_ERROR_MESSAGE;
    }
  };

  private _validateName = () => {
    validateUserName(this.name);
  };

  private _validateIntroduce = () => {
    validateUserIntroduce(this.introduce);
  };

  private _validateTags = () => {
    validateUserTags(this.tags);
  };

  private _filterNotEmptyTags = (tags: string[]) => {
    return tags.filter((tag) => tag.trim().length > 0);
  };
}
