import { Result } from "@/models/common/Result";
import { RoomCreateRequestBody } from "@/models/room/RoomCreateRequestBody";
import { RoomOverview } from "@/models/room/RoomOverview";
import { Room } from "@/stores/RoomListStore";
import { RoomDeleteRequestBody } from "@/models/room/RoomDeleteRequestBody";

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

  public async getRecentRooms(userId: string): Promise<Result<RoomOverview[]>> {
    try {
      const response = await fetch(`api/users/${userId}/recent-rooms`, {
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
      const requestBody = new RoomCreateRequestBody(room);
      const response = await fetch(`api/rooms`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: HEADER,
      });
      if (response.ok) {
        return Result.createSuccessUsingResponseMessage(response);
      } else {
        return await Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  }

  public async deleteRoom(roomId: string) {
    try {
      const requestBody = new RoomDeleteRequestBody(roomId);
      const response = await fetch(`api/rooms/${roomId}`, {
        method: "DELETE",
        body: JSON.stringify(requestBody),
        headers: HEADER,
      });
      if (response.ok) {
        return Result.createSuccessUsingResponseData(response);
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
