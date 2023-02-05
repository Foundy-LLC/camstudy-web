import { NextApiRequest, NextApiResponse } from "next";
import {
  INVALID_ROOM_PASSWORD_ERROR_MESSAGE,
  NO_ROOM_ERROR_MESSAGE,
  ROOM_AVAILABLE_MESSAGE,
  ROOM_IS_FULL_ERROR_MESSAGE,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import { RoomAvailabilityRequestBody } from "@/models/room/RoomAvailabilityRequestBody";
import {
  findRoomById,
  isRoomFull,
  isUserBlockedAtRoom,
} from "@/repository/room.repository";
import { ResponseBody } from "@/models/common/ResponseBody";
import { UserRequestBody } from "@/models/user/UserRequestBody";
import { string } from "prop-types";
import { RoomRequestGet } from "@/models/room/RoomRequestGet";
import { findTagIdsByTagName } from "@/repository/tag.repository";
import { createRoom, findRooms } from "@/repository/room.repository";
import client from "../../prisma/client";
import { RoomRequestBody } from "@/models/room/RoomRequestBody";

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
    const requestBody = new RoomAvailabilityRequestBody(req.body.userId);
    const userId = requestBody.userId;
    const room = await findRoomById(roomId);

    if (room == null) {
      res.status(404).end(new ResponseBody({ message: NO_ROOM_ERROR_MESSAGE }));
      return;
    }

    if (room.master_id !== userId && (await isRoomFull(room.id))) {
      res
        .status(400)
        .end(new ResponseBody({ message: ROOM_IS_FULL_ERROR_MESSAGE }));
      return;
    }

    if (await isUserBlockedAtRoom(userId, room.id)) {
      res
        .status(400)
        .end(
          new ResponseBody({ message: INVALID_ROOM_PASSWORD_ERROR_MESSAGE })
        );
      return;
    }

    res.status(200).end(new ResponseBody({ message: ROOM_AVAILABLE_MESSAGE }));
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).end(e);
      return;
    }
    console.log("ERROR: ", e);
    res
      .status(500)
      .end(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
  }
}

export const getRoom = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const roomFindBody = new RoomRequestGet(req.query.page);
    await res.status(201).json(findRooms(roomFindBody.pageNum)); //roomOverview interface 만들어서 반환
  } catch (e) {
    if (e instanceof string) {
      console.log("bad");
      return res.status(400).end(e);
    }
    console.log("bad2");
    return res.status(500).end(SERVER_INTERNAL_ERROR_MESSAGE);
  }
};

export const postRoom = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const roomPostBody = new RoomRequestBody(req.body);
    await res.status(200).json(createRoom(roomPostBody));
  } catch (e) {
    if (e instanceof string) {
      console.log("bad");
      return res.status(400).end(e);
    }
    console.log("bad2");
    return res.status(500).end(SERVER_INTERNAL_ERROR_MESSAGE);
  }
};
