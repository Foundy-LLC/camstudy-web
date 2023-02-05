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
import { Room } from "@/stores/RoomListStore";
~21;
export class RoomRequestBody {
  private room: Room = new Room();
  constructor(room: Room) {
    this.room = room;
    this._validateId();
    this._validateMasterId();
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

  private _validateId = () => {
    validateId(this.room.id);
  };
  private _validateMasterId = () => {
    validateMasterId(this.room.master_id);
  };
  private _validateTitle = () => {
    validateTitle(this.room.title);
  };
  private _validateTimer = () => {
    validateTimer(this.room.timer);
  };
  private _validateShortBreak = () => {
    validateShortBreak(this.room.short_break);
  };
  private _validateLongBreak = () => {
    validateLongBreak(this.room.long_break);
  };
  private _validateLongBreakInterval = () => {
    validateLongBreakInterval(this.room.long_break_interval);
  };
  private _validateExpiredAt = () => {
    validateExpiredAt(this.room.expired_at);
  };
  //   if (body.password && JSON.stringify(body.password).length - 2 < 4) {
  //   //큰 따옴표 제외
  //   res.status(400).end("비밀번호는 4자 이상으로 설정해야 합니다.");
  // }
  // if (body.timer && (body.timer < 20 || body.timer > 50)) {
  //   res.status(400).end("공부 시간은 20~50분으로만 설정할 수 있습니다.");
  // }
  // if (body.short_break && (body.short_break < 3 || body.short_break > 10)) {
  //   res
  //       .status(400)
  //       .end("짧은 쉬는 시간은 3~10분 범위로만 설정할 수 있습니다.");
  // }
  // if (body.long_break && (body.long_break < 10 || body.long_break > 30)) {
  //   res.status(400).end("긴 쉬는 시간은 10~30분으로만 설정할 수 있습니다.");
  // }
  // if (
  //     body.long_break_interval &&
  //     (body.long_break_interval < 2 || body.long_break_interval > 6)
  // ) {
  //   res.status(400).end("쉬는 시간 인터벌은 2~6회로만 설정할 수 있습니다.");
  // }
}
