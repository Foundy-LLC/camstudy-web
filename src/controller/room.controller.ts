import { NextApiRequest, NextApiResponse } from "next";
import {
  INVALID_ROOM_PASSWORD_ERROR_MESSAGE,
  NO_ROOM_ERROR_MESSAGE,
  ROOM_AVAILABLE_MESSAGE,
  ROOM_IS_FULL_ERROR_MESSAGE,
  ROOM_PASSWORD_NOT_CORRECT_ERROR_MESSAGE,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import { RoomAvailabilityRequestBody } from "@/models/room/RoomAvailabilityRequestBody";
import {
  findRoomById,
  isRoomFull,
  isUserBlockedAtRoom,
} from "@/repository/room.repository";

export const getRoomAvailability = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const roomId = req.query.roomId;
    if (typeof roomId !== "string") {
      res.status(500).end("path에 roomId가 존재하지 않습니다.");
      return;
    }
    const requestBody = new RoomAvailabilityRequestBody(
      req.body.userId,
      req.body.password
    );
    const userId = requestBody.userId;
    const room = await findRoomById(roomId);

    if (room == null) {
      res.status(404).end(NO_ROOM_ERROR_MESSAGE);
      return;
    }

    if (room.password !== requestBody.password) {
      res.status(400).end(ROOM_PASSWORD_NOT_CORRECT_ERROR_MESSAGE);
      return;
    }

    if (room.master_id !== userId && (await isRoomFull(room.id))) {
      res.status(400).end(ROOM_IS_FULL_ERROR_MESSAGE);
      return;
    }

    if (await isUserBlockedAtRoom(userId, room.id)) {
      res.status(400).end(INVALID_ROOM_PASSWORD_ERROR_MESSAGE);
      return;
    }

    res.status(200).end(ROOM_AVAILABLE_MESSAGE);
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).end(e);
      return;
    }
    console.log("ERROR: ", e);
    res.status(500).end(SERVER_INTERNAL_ERROR_MESSAGE);
    return;
  }
};
