import {
  validateExpiredAt,
  validateId,
  validateMasterId,
  validatePassword,
  validateThumbnail,
  validateTitle,
} from "@/utils/rooms.validator";
import { Room } from "@/stores/RoomListStore";
import {
  validateLongBreak,
  validateLongInterval,
  validateShortBreak,
  validateTimerLength,
} from "@/utils/room.validator";

~21;
export class RoomRequestBody {
  private _room: Room;
  constructor(room: Room) {
    this._room = room;
    this._validateId();
    this._validateMasterId();
    this._validateThumbnail();
    this._validatePassword();
    this._validateTitle();
    this._validateTimer();
    this._validateShortBreak();
    this._validateLongBreak();
    this._validateLongInterval();
    this._validateExpiredAt();
  }
  /*
  - 필수 값 null 체크
  -
  */
  get room() {
    return this._room;
  }
  private _validateId = () => {
    validateId(this._room.id);
  };
  private _validateMasterId = () => {
    validateMasterId(this._room.masterId);
  };
  private _validateThumbnail = () => {
    validateThumbnail(this._room.thumbnail);
  };
  private _validatePassword = () => {
    validatePassword(this._room.password);
  };
  private _validateTitle = () => {
    validateTitle(this._room.title);
  };
  private _validateTimer = () => {
    validateTimerLength(this._room.timer);
  };
  private _validateShortBreak = () => {
    validateShortBreak(this._room.shortBreak);
  };
  private _validateLongBreak = () => {
    validateLongBreak(this._room.longBreak);
  };
  private _validateLongInterval = () => {
    validateLongInterval(this._room.longBreakInterval);
  };
  private _validateExpiredAt = () => {
    validateExpiredAt(this._room.expiredAt);
  };
}
