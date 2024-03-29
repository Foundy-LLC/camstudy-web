import { Result } from "@/models/common/Result";
import { RoomCreateRequestBody } from "@/models/room/RoomCreateRequestBody";
import { RoomOverview } from "@/models/room/RoomOverview";
import { Room } from "@/stores/RoomListStore";
import { fetchAbsolute, rankingApiFetch } from "@/utils/fetchAbsolute";
import { RoomGetRequestBody } from "@/models/room/RoomGetRequestBody";

const HEADER = {
  "Content-Type": "application/json",
};

export class RoomService {
  public async getRoom(roomId: string): Promise<Result<RoomOverview>> {
    try {
      const requestBody = new RoomGetRequestBody(roomId);
      const response = await fetchAbsolute(`api/rooms/${requestBody.roomId}`, {
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

  public async getRooms(
    page: number,
    roomName: string
  ): Promise<Result<RoomOverview[]>> {
    try {
      const response = await fetchAbsolute(
        `api/rooms?page=${page}&query=${roomName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
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
      const response = await fetchAbsolute(`api/users/${userId}/recent-rooms`, {
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

  public async getRecommendedRooms(
    userId: string
  ): Promise<Result<{ rooms: RoomOverview[] }>> {
    try {
      const response = await rankingApiFetch(
        `api/users/${userId}/recommended-rooms`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        return Result.createSuccessUsingResponseData(response);
      } else {
        return Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  }

  public async createRoom(room: Room): Promise<Result<RoomOverview>> {
    try {
      const requestBody = new RoomCreateRequestBody(
        room.masterId,
        room.title,
        room.timer,
        room.password,
        room.shortBreak,
        room.longBreak,
        room.longBreakInterval,
        room.expiredAt,
        room.tags
      );
      const response = await fetchAbsolute(`api/rooms`, {
        method: "POST",
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

  public async deleteRoom(roomId: string) {
    try {
      const response = await fetchAbsolute(`api/rooms/${roomId}`, {
        method: "DELETE",
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
      const response = await fetchAbsolute(`api/rooms/${roomId}/thumbnail`, {
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
