import { NO_USER_UID_ERROR_MESSAGE } from "@/constants/message";
import {
  validateUserIntroduce,
  validateUserName,
  validateUserTags,
} from "@/utils/user.validator";

export class RoomRequestBody {
  constructor(
    readonly id: string,
    readonly master_id: string,
    readonly title: string,
    readonly thumbnail: string | undefined,
    readonly password: string | undefined,
    readonly timer: number,
    readonly short_break: number,
    readonly long_break: number,
    readonly long_break_interval: number,
    readonly expired_at: string
  ) {
    // this._validateUid();
    // this._validateName();
    // this._validateIntroduce();
    // this.tags = this._filterNotEmptyTags(this.tags);
    // this.tags = this._filterDuplicatedTags(this.tags);
    // this._validateTags();
  }
  /*
  - 필수 값 null 체크
  -
  */
  private _validateId = () => {
    if (this.id == null) {
      throw NO_USER_UID_ERROR_MESSAGE;
    }
  };

  private _validateMasterId = () => {
    if (this.id == null) {
      throw NO_USER_UID_ERROR_MESSAGE;
    }
  };
  private _validateTitle = () => {
    if (this.id == null) {
      throw NO_USER_UID_ERROR_MESSAGE;
    }
  };
  private _validateTimer = () => {
    if (this.id == null) {
      throw NO_USER_UID_ERROR_MESSAGE;
    }
  };
  private _validateShortBreak = () => {
    if (this.id == null) {
      throw NO_USER_UID_ERROR_MESSAGE;
    }
  };
  private _validateLongBreak = () => {
    if (this.id == null) {
      throw NO_USER_UID_ERROR_MESSAGE;
    }
  };
  private _validateLongBreakInterval = () => {
    if (this.id == null) {
      throw NO_USER_UID_ERROR_MESSAGE;
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

  private _filterNotEmptyTags = (tags: string[]): string[] => {
    return tags?.filter((tag) => tag.trim().length > 0);
  };

  private _filterDuplicatedTags = (tags: string[]): string[] => {
    return [...new Set(tags)];
  };
}
