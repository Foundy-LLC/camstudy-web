import {
  validateExpiredAt,
  validateMasterId,
  validatePassword,
  validateTitle,
} from "@/utils/rooms.validator";
import {
  validateLongBreak,
  validateLongInterval,
  validateShortBreak,
  validateTimerLength,
} from "@/utils/room.validator";
import { validateUserTags } from "@/utils/user.validator";
import {
  createTagsIfNotExists,
  findTagIdsByTagName,
} from "@/repository/tag.repository";

export class RoomCreateRequestBody {
  private _tagIds?: { id: string }[];

  constructor(
    readonly masterId: string,
    readonly title: string,
    readonly timer: number,
    readonly password: string | undefined,
    readonly shortBreak: number,
    readonly longBreak: number,
    readonly longBreakInterval: number,
    readonly expiredAt: Date,
    readonly tags: string[]
  ) {
    this._validateMasterId();
    this._validatePassword();
    this._validateTitle();
    this._validateTimer();
    this._validateShortBreak();
    this._validateLongBreak();
    this._validateLongInterval();
    this._validateExpiredAt();
    this.tags = this._filterNotEmptyTags(this.tags);
    this.tags = this._filterDuplicatedTags(this.tags);
    this._validateTags();
  }

  get tagIds() {
    return this._tagIds;
  }

  private _validateMasterId = () => {
    validateMasterId(this.masterId);
  };

  private _validatePassword = () => {
    validatePassword(this.password);
  };

  private _validateTitle = () => {
    validateTitle(this.title);
  };

  private _validateTimer = () => {
    validateTimerLength(this.timer);
  };

  private _validateShortBreak = () => {
    validateShortBreak(this.shortBreak);
  };

  private _validateLongBreak = () => {
    validateLongBreak(this.longBreak);
  };

  private _validateLongInterval = () => {
    validateLongInterval(this.longBreakInterval);
  };

  private _validateExpiredAt = () => {
    validateExpiredAt(this.expiredAt);
  };
  private _validateTags = async () => {
    validateUserTags(this.tags);
    await createTagsIfNotExists(this.tags);
    this._tagIds = await findTagIdsByTagName(this.tags);
  };

  private _filterNotEmptyTags = (tags: string[]): string[] => {
    return tags?.filter((tag) => tag.trim().length > 0);
  };

  private _filterDuplicatedTags = (tags: string[]): string[] => {
    return [...new Set(tags)];
  };
}
