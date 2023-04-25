import {
  validateExpiredAt,
  validateId,
  validateMasterId,
  validatePassword,
  validateTitle,
} from "@/utils/rooms.validator";
import { Room } from "@/stores/RoomListStore";
import {
  validateLongBreak,
  validateLongInterval,
  validateShortBreak,
  validateTimerLength,
} from "@/utils/room.validator";

export class RoomCreateRequestBody {
  readonly masterId: string;
  readonly title: string;
  readonly password: string | undefined;
  readonly timer: number;
  readonly shortBreak: number;
  readonly longBreak: number;
  readonly longBreakInterval: number;
  readonly expiredAt: Date;

  constructor(room: Room) {
    this.masterId = room.masterId;
    this.title = room.title;
    this.timer = room.timer;
    this.password = room.password;
    this.shortBreak = room.shortBreak;
    this.longBreak = room.longBreak;
    this.longBreakInterval = room.longBreakInterval;
    this.expiredAt = room.expiredAt;

    this._validateMasterId();
    this._validatePassword();
    this._validateTitle();
    this._validateTimer();
    this._validateShortBreak();
    this._validateLongBreak();
    this._validateLongInterval();
    this._validateExpiredAt();
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
}
