import { UserRequestBody } from "@/models/user/UserRequestBody";
import {
  createTagsIfNotExists,
  findTagIdsByTagName,
} from "@/repository/tag.repository";
import { createUser, isExistUser } from "@/repository/user.repository";
import {
  EXISTS_INITIAL_INFORMATION_MESSAGE,
  NO_EXISTS_INITIAL_INFORMATION_MESSAGE,
  PROFILE_CREATE_SUCCESS,
  ROOM_AVAILABLE_MESSAGE,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import { string } from "prop-types";
import { NextApiRequest, NextApiResponse } from "next";
import { ResponseBody } from "@/models/common/ResponseBody";
import { InitialInformationRequestBody } from "@/models/user/InitialInformationRequestBody";
import multer from "multer";
import { multipartUploader } from "@/service/imageUploader";
import * as path from "path";
import { auth } from "@/service/firebase";

interface response {
  exists: boolean;
  message: string;
}

export const getUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const requestBody = new InitialInformationRequestBody(
      <string>req.query.uid
    );
    const isNewUser = await isExistUser(requestBody.userId);
    const { exists } = isNewUser[0];
    const response: response = {
      ...isNewUser[0],
      message: "",
    };
    if (exists) {
      response["message"] = EXISTS_INITIAL_INFORMATION_MESSAGE;
      res.status(200).send(response);
    } else {
      response["message"] = NO_EXISTS_INITIAL_INFORMATION_MESSAGE;
      res.status(404).send(response);
    }
  } catch (e) {
    if (e instanceof string) {
      res.status(400).end(e);
      return;
    }
    res.status(500).end(SERVER_INTERNAL_ERROR_MESSAGE);
    return;
  }
};

export const postUser = async (req: NextApiRequest, res: NextApiResponse) => {
  // TODO: 로깅하기
  try {
    const userCreateBody = new UserRequestBody(
      req.body.userId,
      req.body.name,
      req.body.introduce,
      req.body.tags
    );

    await createTagsIfNotExists(userCreateBody.tags);

    const tagIds = await findTagIdsByTagName(userCreateBody.tags);

    await createUser(
      userCreateBody.userId,
      userCreateBody.name,
      userCreateBody.introduce,
      tagIds
    );
    res.status(201).json(new ResponseBody({ message: PROFILE_CREATE_SUCCESS }));
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).end(e);
      return;
    }
    res
      .status(500)
      .end(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
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
export const postProfileImage = async (
  req: NextApiRequest & { [key: string]: any },
  res: NextApiResponse
) => {
  const multerUpload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, callback) {
        callback(null, "uploads/");
      },
      filename: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        callback(null, auth.currentUser?.uid + ext);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  await runMiddleware(req, res, multerUpload.single("profileImage"));
  const file = req.file;
  const others = req.body;
  const ext = path.extname(file.originalname);
  console.log(file);

  const signedUrl = await multipartUploader(others.fileName + ext, file.path);

  res.status(200).json({ profileImageUrl: signedUrl });
};
