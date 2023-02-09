import { UserPostRequestBody } from "@/models/user/UserPostRequestBody";
import {
  createTagsIfNotExists,
  findTagIdsByTagName,
} from "@/repository/tag.repository";
import { createUser, isUserExists } from "@/repository/user.repository";
import {
  EXISTS_INITIAL_INFORMATION_MESSAGE,
  NO_EXISTS_INITIAL_INFORMATION_MESSAGE,
  PROFILE_CREATE_SUCCESS,
  PROFILE_IMAGE_UPDATE,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import { NextApiRequest, NextApiResponse } from "next";
import { ResponseBody } from "@/models/common/ResponseBody";
import { InitialInformationRequestBody } from "@/models/user/InitialInformationRequestBody";
import multer from "multer";
import { multipartUploader } from "@/service/imageUploader";
import { uuidv4 } from "@firebase/util";

export const getUserExistence = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const requestBody = new InitialInformationRequestBody(
      <string>req.query.userId
    );
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
      res.status(400).end(new ResponseBody({ message: e }));
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
  try {
    const multerUpload = multer({
      storage: multer.diskStorage({
        destination: function (req, file, callback) {
          callback(null, "uploads/");
        },
        filename: function (req, file, callback) {
          callback(null, uuidv4() + ".png");
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    });

    await runMiddleware(req, res, multerUpload.single("profileImage"));
    const file = req.file;
    const others = req.body;
    console.log(file);

    const signedUrl = await multipartUploader(
      "users/" + others.fileName + ".png",
      file.path
    );
    // const result = await insertUserProfileImage(others.fileName, signedUrl);
    // console.log(result);
    res.status(201).send(
      new ResponseBody({
        message: PROFILE_IMAGE_UPDATE,
        data: signedUrl,
      })
    );
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).end(new ResponseBody({ message: e }));
      return;
    }
    res
      .status(500)
      .end(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
    return;
  }
};
