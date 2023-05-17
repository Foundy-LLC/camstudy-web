import { validateId } from "@/utils/rooms.validator";

export class RoomGetRequestBody {
  constructor(readonly roomId: string) {
    this._validateRoomid();
  }
  private _validateRoomid = () => {
    validateId(this.roomId);
  };
}
