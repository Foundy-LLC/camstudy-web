import { UserRequestBody } from "@/models/user/UserRequestBody";
import {
  createTagsIfNotExists,
  findTagIdsByTagName,
} from "@/repository/tag.repository";
import { createUser, isExistUser } from "@/repository/user.repository";
import {
  PROFILE_CREATE_SUCCESS,
  ROOM_AVAILABLE_MESSAGE,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import { string } from "prop-types";
import { NextApiRequest, NextApiResponse } from "next";
import { ResponseBody } from "@/models/common/ResponseBody";
import { InitialInformationRequestBody } from "@/models/user/InitialInformationRequestBody";

export const getUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const requestBody = new InitialInformationRequestBody(
      <string>req.query.uid
    );
    const isNewUser = await isExistUser(requestBody.userId);
    const { exists } = isNewUser[0];
    if (exists) {
      res.status(200).send(isNewUser[0]);
    } else {
      res.status(404).send(isNewUser[0]);
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
