import { UserRequestBody } from "@/models/user/UserRequestBody";
import { Result } from "@/models/common/Result";
import { RoomRequestBody } from "@/models/room/RoomRequestBody";

const HEADER = {
  "Content-Type": "application/json",
};

export class RoomService {
  public async getRoom(RoomPage: number) {
    const response = await fetch(`api/rooms?page=${RoomPage}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const resJson = await response.json();
    console.log(resJson);
    resJson.map((value: any) => {
      roomStore.createRoom(
        value.id,
        value.master_id,
        value.title,
        value.thumnail,
        value.password,
        value.timer,
        value.short_break,
        value.long_break,
        value.long_break_interval,
        value.expired_at
      );
    });
    if (resJson !== undefined) {
      var Rooms: string = "방 조회 결과:";
      roomStore.rooms.map((room) => {
        Rooms += `, ${room.id}`;
      });
      setRoomInfo(Rooms);
    }
  }
  public async createRoom(
    id: string,
    master_id: string,
    title: string,
    thumbnail: string | undefined,
    password: string | undefined,
    timer: number,
    short_break: number,
    long_break: number,
    long_break_interval: number,
    expired_at: string
  ): Promise<Result<void>> {
    try {
      const requestBody = new RoomRequestBody(
        id,
        master_id,
        title,
        thumbnail,
        password,
        timer,
        short_break,
        long_break,
        long_break_interval,
        expired_at
      );
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
