import { Result } from "@/models/common/Result";
import { RoomRequestBody } from "@/models/room/RoomRequestBody";
import { RoomOverview } from "@/models/room/RoomOverview";
import { Room } from "@/stores/RoomListStore";
import { ROOM_CREATE_SUCCESS } from "@/constants/roomMessage";

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
        return Result.success(ROOM_CREATE_SUCCESS);
      } else {
        return await Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  }

  public async uploadThumbnailImage(
    roomId: string,
    formData: FormData
  ): Promise<Result<string>> {
    try {
      const response = await fetch(`api/rooms/${roomId}/thumbnail`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        return await Result.createErrorUsingResponseMessage(response);
      }
      return Result.createSuccessUsingResponseData(response);
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  }
}
const roomService = new RoomService();
export default roomService;
