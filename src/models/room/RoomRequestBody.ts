import {
  NO_ROOM_EXPIRED_AT_ERROR_MESSAGE,
  NO_ROOM_ID_ERROR_MESSAGE,
  NO_ROOM_LONG_BREAK_ERROR_MESSAGE,
  NO_ROOM_LONG_BREAK_INTERVAL_ERROR_MESSAGE,
  NO_ROOM_SHORT_BREAK_ERROR_MESSAGE,
  NO_ROOM_TIMER_ERROR_MESSAGE,
  NO_ROOM_TITLE_ERROR_MESSAGE,
  NO_USER_NAME_ERROR_MESSAGE,
  NO_USER_UID_ERROR_MESSAGE,
} from "@/constants/message";
import {
  validateUserIntroduce,
  validateUserName,
  validateUserTags,
} from "@/utils/user.validator";
import {
  validateExpiredAt,
  validateId,
  validateLongBreak,
  validateLongBreakInterval,
  validateMasterId,
  validateShortBreak,
  validateTimer,
  validateTitle,
} from "@/utils/rooms.validator";
~21;
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
    validateId(this.id);
  };

  private _validateMasterId = () => {
    validateMasterId(this.master_id);
  };
  private _validateTitle = () => {
    validateTitle(this.title);
  };
  private _validateTimer = () => {
    validateTimer(this.timer);
  };
  private _validateShortBreak = () => {
    validateShortBreak(this.short_break);
  };
  private _validateLongBreak = () => {
    validateLongBreak(this.long_break);
  };
  private _validateLongBreakInterval = () => {
    validateLongBreakInterval(this.long_break_interval);
  };
  private _validateExpiredAt = () => {
    validateExpiredAt(this.expired_at);
  };

  private _filterNotEmptyTags = (tags: string[]): string[] => {
    return tags?.filter((tag) => tag.trim().length > 0);
  };

  private _filterDuplicatedTags = (tags: string[]): string[] => {
    return [...new Set(tags)];
  };
}
