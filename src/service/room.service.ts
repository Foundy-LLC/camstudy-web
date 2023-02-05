import { UserRequestBody } from "@/models/user/UserRequestBody";
import { Result } from "@/models/common/Result";
import { RoomRequestBody } from "@/models/room/RoomRequestBody";
import { Room } from "@/stores/RoomListStore";

const HEADER = {
  "Content-Type": "application/json",
};

export class RoomService {
  public async getRooms(page: number): Promise<Result<Response | undefined>> {
    try {
      const response = await fetch(`api/rooms?page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        return Result.success(response);
      } else {
        console.log("not ok");
        return Result.errorResponse(response);
      }
    } catch (e) {
      console.log("망");
      return Result.errorCatch(e);
    }
    //   console.log(response);
    //   const resJson: any = response.json();
    //   resJson.map((value: any) => {
    //     roomStore.createRoom(
    //       value.id,
    //       value.master_id,
    //       value.title,
    //       value.thumnail,
    //       value.password,
    //       value.timer,
    //       value.short_break,
    //       value.long_break,
    //       value.long_break_interval,
    //       value.expired_at
    //     );
    //   });
    //   if (resJson !== undefined) {
    //     var Rooms: string = "방 조회 결과:";
    //     roomStore.rooms.map((room) => {
    //       Rooms += `, ${room.id}`;
    //     });
    //     setRoomInfo(Rooms);
    //   }
    // } else {
    // }
  }
  public async createRoom(room: Room): Promise<Result<void>> {
    try {
      const requestBody = new RoomRequestBody(room);
      const response = await fetch(`api/rooms`, {
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
