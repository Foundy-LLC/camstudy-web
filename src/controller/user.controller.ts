import { UserRequestBody } from "@/models/user/UserRequestBody";
import {
  createTagsIfNotExists,
  findTagIdsByTagName,
} from "@/repository/tag.repository";
import { createUser } from "@/repository/user.repository";
import {
  PROFILE_CREATE_SUCCESS,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import { string } from "prop-types";
import { NextApiRequest, NextApiResponse } from "next";

export const postUser = async (req: NextApiRequest, res: NextApiResponse) => {
  // TODO: 로깅하기
  try {
    const userCreateBody = new UserRequestBody(
      req.body.uid,
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
    res.status(201).json(PROFILE_CREATE_SUCCESS);
  } catch (e) {
    if (e instanceof string) {
      res.status(400).end(e);
      return;
    }
    res.status(500).end(SERVER_INTERNAL_ERROR_MESSAGE);
    return;
  }
};
