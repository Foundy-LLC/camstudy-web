import { UserRequestBody } from "@/models/user/UserRequestBody";
import { Result } from "@/models/common/Result";
import { RoomRequestBody } from "@/models/room/RoomRequestBody";
import { Room } from "@/stores/RoomListStore";
import { RoomOverview } from "@/models/room/RoomOverview";

const HEADER = {
  "Content-Type": "application/json",
};

export class RoomService {
  public async getRooms(
    page: number
  ): Promise<Result<RoomOverview[]> {
    try {
      const response = await fetch(`api/rooms?page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        await response.json().then((data: RoomOverview[]) => {
          return Result.success(data);
        });
      } else {
        return Result.errorResponse(response);
      }
    } catch (e) {
      return Result.errorCatch(e);
    }
  }
  public async createRoom(
    room: Room
  ): Promise<Result<Response | string | undefined>> {
    try {
      const requestBody = new RoomRequestBody(room);

      const response = await fetch(`api/rooms`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: HEADER,
      });
      if (response.ok) {
        return Result.success("방 개설을 성공했습니다.");
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
