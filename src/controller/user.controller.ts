import { UserPostRequestBody } from "@/models/user/UserPostRequestBody";
import {
  createTagsIfNotExists,
  findTagIdsByTagName,
} from "@/repository/tag.repository";
import {
  createUser,
  findUser,
  insertUserProfileImage,
  isUserExists,
} from "@/repository/user.repository";
import {
  EXISTS_INITIAL_INFORMATION_MESSAGE,
  NO_EXISTS_INITIAL_INFORMATION_MESSAGE,
  NOT_FOUND_USER_MESSAGE,
  PROFILE_CREATE_SUCCESS,
  IMAGE_SIZE_EXCEED_MESSAGE,
  PROFILE_IMAGE_UPDATE,
  SERVER_INTERNAL_ERROR_MESSAGE,
  USER_INFORMATION_LOOKUP_SUCCESS,
} from "@/constants/message";
import { NextApiRequest, NextApiResponse } from "next";
import { ResponseBody } from "@/models/common/ResponseBody";
import multer, { MulterError } from "multer";
import { multipartUploader } from "@/service/imageUploader";
import { uuidv4 } from "@firebase/util";
import runMiddleware from "@/utils/runMiddleware";
import { MAX_IMAGE_BYTE_SIZE } from "@/constants/image.constant";
import { ValidateUid } from "@/models/common/ValidateUid";

export const getUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const requestBody = new ValidateUid(<string>req.query.userId);
    const user = await findUser(requestBody.userId);

    if (user == null) {
      res
        .status(404)
        .send(new ResponseBody({ message: NOT_FOUND_USER_MESSAGE }));
      return;
    }

    res.status(200).send(
      new ResponseBody({
        message: USER_INFORMATION_LOOKUP_SUCCESS,
        data: user,
      })
    );
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    res
      .status(500)
      .end(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
    return;
  }
};
export const getUserExistence = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const requestBody = new ValidateUid(<string>req.query.userId);
    const exists = await isUserExists(requestBody.userId);
    res.status(200).send(
      new ResponseBody({
        message: exists
          ? EXISTS_INITIAL_INFORMATION_MESSAGE
          : NO_EXISTS_INITIAL_INFORMATION_MESSAGE,
        data: exists,
      })
    );
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    res
      .status(500)
      .end(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
    return;
  }
};

export const postUser = async (req: NextApiRequest, res: NextApiResponse) => {
  // TODO: 로깅하기
  try {
    const userCreateBody = new UserPostRequestBody(
      req.body.userId,
      req.body.name,
      req.body.introduce,
      req.body.tags,
      req.body.profileImageUrl
    );

    await createTagsIfNotExists(userCreateBody.tags);

    const tagIds = await findTagIdsByTagName(userCreateBody.tags);

    await createUser(
      userCreateBody.userId,
      userCreateBody.name,
      userCreateBody.introduce,
      tagIds,
      userCreateBody.profileImageUrl
    );
    res.status(201).json(new ResponseBody({ message: PROFILE_CREATE_SUCCESS }));
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(e);
      return;
    }
    res
      .status(500)
      .end(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
    return;
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};
export const postProfileImage = async (
  req: NextApiRequest & { [key: string]: any },
  res: NextApiResponse
) => {
  try {
    const userId = req.query.userId;
    if (typeof userId !== "string") {
      res.status(404).send(
        new ResponseBody({
          message: "잘못된 query 접근입니다. 회원 ID가 문자열이 아닙니다.",
        })
      );
      return;
    }
    const multerUpload = multer({
      storage: multer.diskStorage({
        destination: function (req, file, callback) {
          callback(null, "uploads/");
        },
        filename: function (req, file, callback) {
          callback(null, uuidv4() + ".png");
        },
      }),
      limits: { fileSize: MAX_IMAGE_BYTE_SIZE },
    });

    await runMiddleware(req, res, multerUpload.single("profileImage"));
    const file = req.file;
    console.log(file);

    const signedUrl = await multipartUploader(
      "users/" + userId + ".png",
      file.path
    );

    await insertUserProfileImage(userId, signedUrl);
    res.status(201).send(
      new ResponseBody({
        message: PROFILE_IMAGE_UPDATE,
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
      .end(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
    return;
  }
};
