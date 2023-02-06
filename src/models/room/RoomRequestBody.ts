import {
  validateExpiredAt,
  validateId,
  validateLongBreak,
  validateLongBreakInterval,
  validateMasterId, validatePassword,
  validateShortBreak,
  validateThumbnail,
  validateTimer,
  validateTitle,
} from "@/utils/rooms.validator";
import { Room } from "@/stores/RoomListStore";
~21;
export class RoomRequestBody {
  private room: Room
  constructor(room: Room) {
    this.room = room;
    this._validateId();
    this._validateMasterId();
    this._validateThumbnail();
    this._validatePassword();
    this._validateTitle();
    this._validateTimer();
    this._validateShortBreak();
    this._validateLongBreak();
    this._validateLongBreakInterval();
    this._validateExpiredAt();
  }
  /*
  - 필수 값 null 체크
  -
  */
  get get_room (){
    return this.room;
  };
  private _validateId = () => {
    validateId(this.room._id);
  };
  private _validateMasterId = () => {
    validateMasterId(this.room._master_id);
  };
  private _validateThumbnail = () => {
    validateThumbnail(this.room._thumbnail);
  };
  private _validatePassword = () => {
    validatePassword(this.room._password);
  };
  private _validateTitle = () => {
    validateTitle(this.room._title);
  };
  private _validateTimer = () => {
    validateTimer(this.room._timer);
  };
  private _validateShortBreak = () => {
    validateShortBreak(this.room._short_break);
  };
  private _validateLongBreak = () => {
    validateLongBreak(this.room._long_break);
  };
  private _validateLongBreakInterval = () => {
    validateLongBreakInterval(this.room._long_break_interval);
  };
  private _validateExpiredAt = () => {
    validateExpiredAt(this.room._expired_at);
  };
}
