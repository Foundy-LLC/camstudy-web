import { NextApiRequest, NextApiResponse } from "next";
import {
  IMAGE_SIZE_EXCEED_MESSAGE,
  INVALID_ROOM_PASSWORD_ERROR_MESSAGE,
  NO_ROOM_ERROR_MESSAGE,
  REQUEST_QUERY_ERROR,
  ROOM_AVAILABLE_MESSAGE,
  ROOM_IS_FULL_ERROR_MESSAGE,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import { RoomAvailabilityRequestBody } from "@/models/room/RoomAvailabilityRequestBody";
import {
  createRoom,
  deleteRoomReq,
  findRecentRooms,
  findRoomById,
  findRooms,
  isRoomFull,
  isUserBlockedAtRoom,
} from "@/repository/room.repository";
import { ResponseBody } from "@/models/common/ResponseBody";
import { RoomCreateRequestBody } from "@/models/room/RoomCreateRequestBody";
import { RoomsGetRequest } from "@/models/room/RoomsGetRequest";
import multer, { MulterError } from "multer";
import { multipartUploader } from "@/service/imageUploader";
import {
  GET_RECENT_ROOM_SUCCESS,
  GET_ROOMS_SUCCESS,
  ROOM_BODY_INVALID_ERROR_MESSAGE,
  ROOM_CREATE_SUCCESS,
  ROOM_DELETE_SUCCESS,
  SET_ROOM_THUMBNAIL_SUCCESS,
} from "@/constants/roomMessage";
import * as path from "path";
import { MAX_IMAGE_BYTE_SIZE } from "@/constants/image.constant";
import { RoomDeleteRequestBody } from "@/models/room/RoomDeleteRequestBody";
import { RecentRoomsGetRequest } from "@/models/room/RecentRoomsGetRequest";
import runMiddleware from "@/utils/runMiddleware";
import { uuidv4 } from "@firebase/util";
import {
  createTagsIfNotExists,
  findTagIdsByTagName,
} from "@/repository/tag.repository";
import { Room } from "@/stores/RoomListStore";

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
};

export const getRooms = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const page = req.query.page;
    const query = req.query.query as string;
    if (typeof page !== "string" || Array.isArray(query)) {
      res.status(400).send(new ResponseBody({ message: REQUEST_QUERY_ERROR }));
      return;
    }
    const roomsGetBody = new RoomsGetRequest(page, query);
    const result = await findRooms(roomsGetBody.pageNum, roomsGetBody.query);
    res.status(201).json(
      new ResponseBody({
        data: result,
        message: GET_ROOMS_SUCCESS,
      })
    );
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
  }
};

export const getRecentRooms = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    if (typeof req.query.userId !== "string") {
      res.status(400).send(new ResponseBody({ message: REQUEST_QUERY_ERROR }));
      return;
    }
    const roomsGetBody = new RecentRoomsGetRequest(req.query.userId);
    const result = await findRecentRooms(roomsGetBody.userId);
    res.status(201).json(
      new ResponseBody({
        data: result,
        message: GET_RECENT_ROOM_SUCCESS,
      })
    );
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
  }
};

export const postRoom = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const body = req.body;
    console.log(body);
    const requestBody = new RoomCreateRequestBody(
      body.masterId,
      body.title,
      body.timer,
      body.password,
      body.shortBreak,
      body.longBreak,
      body.longBreakInterval,
      body.expiredAt,
      body.tags
    );
    if (requestBody == null) {
      res
        .status(400)
        .send(new ResponseBody({ message: ROOM_BODY_INVALID_ERROR_MESSAGE }));
      return;
    }
    await createRoom(requestBody);
    res.status(201).send(new ResponseBody({ message: ROOM_CREATE_SUCCESS }));
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
    return;
  }
};

export const deleteRoom = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { roomId } = req.query;
    if (typeof roomId !== "string") throw REQUEST_QUERY_ERROR;
    await deleteRoomReq(new RoomDeleteRequestBody(roomId));
    res.status(201).send(new ResponseBody({ message: ROOM_DELETE_SUCCESS }));
  } catch (e) {
    if (typeof e === "string") {
      console.log("error:400", e);
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    console.log("error: 500");
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
    return;
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export const postRoomThumbnail = async (
  req: NextApiRequest & { [key: string]: any },
  res: NextApiResponse
) => {
  try {
    const multerUpload = multer({
      storage: multer.diskStorage({
        filename: function (req, file, callback) {
          const ext = path.extname(file.originalname);
          callback(null, uuidv4() + ext);
        },
      }),
      limits: { fileSize: MAX_IMAGE_BYTE_SIZE },
    });
    await runMiddleware(req, res, multerUpload.single("roomThumbnail"));
    const file = req.file;
    const { roomId } = req.query;
    const signedUrl: string = await multipartUploader(
      "rooms/" + roomId + ".png",
      file.path
    );

    res.status(201).send(
      new ResponseBody({
        message: SET_ROOM_THUMBNAIL_SUCCESS,
        data: signedUrl,
      })
    );
  } catch (e) {
    if (e instanceof MulterError && e.code === "LIMIT_FILE_SIZE") {
      res
        .status(400)
        .send(new ResponseBody({ message: IMAGE_SIZE_EXCEED_MESSAGE }));
      return;
    }
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
    return;
  }
};
