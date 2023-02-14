import { NextApiRequest, NextApiResponse } from "next";
import {
  INVALID_ROOM_PASSWORD_ERROR_MESSAGE,
  NO_ROOM_ERROR_MESSAGE,
  PROFILE_IMAGE_SIZE_ERROR_MESSAGE,
  REQUEST_QUERY_ERROR,
  ROOM_AVAILABLE_MESSAGE,
  ROOM_IS_FULL_ERROR_MESSAGE,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import { RoomAvailabilityRequestBody } from "@/models/room/RoomAvailabilityRequestBody";
import {
  createRoom,
  deleteRoomReq,
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
import { SET_ROOM_THUMBNAIL_SUCCESS } from "@/constants/roomMessage";
import * as path from "path";
import { MAX_IMAGE_BYTE_SIZE } from "@/constants/image.constant";
import { RoomDeleteRequestBody } from "@/models/room/RoomDeleteRequestBody";

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
    if (typeof req.query.page !== "string") {
      res.status(400).send(new ResponseBody({ message: REQUEST_QUERY_ERROR }));
      return;
    }
    const roomsGetBody = new RoomsGetRequest(req.query.page);
    const result = await findRooms(roomsGetBody.pageNum);
    res.status(201).json(
      new ResponseBody({
        data: result,
        message: "공부방 목록을 성공적으로 얻었습니다",
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
    await createRoom(new RoomCreateRequestBody(req.body._room));
    res.status(201).end();
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

export const deleteRoom = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await deleteRoomReq(new RoomDeleteRequestBody(req.body.roomId));
    res.status(201).end();
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

function runMiddleware(
  req: NextApiRequest & { [key: string]: any },
  res: NextApiResponse,
  fn: (...args: any[]) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

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
          callback(null, "test" + ext);
        },
      }),
      limits: { fileSize: MAX_IMAGE_BYTE_SIZE },
    });
    await runMiddleware(req, res, multerUpload.single("roomThumbnail"));
    const file = req.file;
    const others = req.body;
    const signedUrl: string = await multipartUploader(
      "rooms/" + others.roomId + ".png",
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
        .send(new ResponseBody({ message: PROFILE_IMAGE_SIZE_ERROR_MESSAGE }));
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
