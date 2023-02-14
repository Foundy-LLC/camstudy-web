import { validateId } from "@/utils/rooms.validator";

export class RoomDeleteRequestBody {
  constructor(readonly roomId: string) {
    this._validateRoomid();
  }
  private _validateRoomid = () => {
    validateId(this.roomId);
  };
}
