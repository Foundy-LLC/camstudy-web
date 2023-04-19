import { NO_USER_UID_ERROR_MESSAGE } from "@/constants/message";
import {
  validateUserIntroduce,
  validateUserName,
  validateUserTags,
} from "@/utils/user.validator";
import { User } from "@/models/user/User";

export class updateUserRequestBody {
  constructor(
    readonly userId: string,
    readonly nickName: string,
    readonly introduce: string,
    readonly tags: string[]
  ) {
    this._validateUid();
    this._validateName();
    this._validateIntroduce();
    this._filterNotEmptyTags(tags);
    this._filterDuplicatedTags(tags);
    this._validateTags();
  }

  private _validateUid = () => {
    if (this.userId == null) {
      throw NO_USER_UID_ERROR_MESSAGE;
    }
  };

  private _validateName = () => {
    validateUserName(this.nickName);
  };

  private _validateIntroduce = () => {
    validateUserIntroduce(this.introduce);
  };

  private _validateTags = () => {
    validateUserTags(this.tags);
  };

  private _filterNotEmptyTags = (tags: string[]): string[] => {
    return tags?.filter((tag) => tag.trim().length > 0);
  };

  private _filterDuplicatedTags = (tags: string[]): string[] => {
    return [...new Set(tags)];
  };
}
