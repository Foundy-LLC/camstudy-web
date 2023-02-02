import { UserRequestBody } from "@/models/user/UserRequestBody";
import { Result } from "@/models/common/Result";
import { RoomRequestBody } from "@/models/user/RoomRequestBody";

const HEADER = {
  "Content-Type": "application/json",
};

export class RoomService {
  public async createRoom(
    id: string,
    master_id: string,
    title: string,
    thumnail: string | undefined,
    password: string | undefined,
    timer: number,
    short_break: number,
    long_break: number,
    long_break_interval: number,
    expired_at: string
  ): Promise<Result<void>> {
    try {
      const requestBody = new RoomRequestBody(uid, name, introduce, tags);
      const response = await fetch(`api/users`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: HEADER,
      });
      if (response.ok) {
        return Result.success(undefined);
      } else {
        return await Result.errorResponse(response);
      }
    } catch (e) {
      return Result.errorCatch(e);
    }
  }
}

const roomService = new RoomService();
export default RoomService;
