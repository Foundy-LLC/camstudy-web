import { Result } from "@/models/common/Result";
import { RoomRequestBody } from "@/models/room/RoomRequestBody";
import { RoomOverview } from "@/models/room/RoomOverview";
import { Room } from "@/stores/RoomListStore";

const HEADER = {
  "Content-Type": "application/json",
};

export class RoomService {
  public async getRooms(page: number): Promise<Result<RoomOverview[]>> {
    try {
      const response = await fetch(`api/rooms?page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        return Result.createSuccessUsingResponseData(response);
      } else {
        return Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  }
  public async createRoom(room: Room): Promise<Result<string>> {
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
        return await Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  }
}

const roomService = new RoomService();
export default RoomService;
