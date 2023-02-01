import { PrismaClient } from "@prisma/client";
import { UserCreateBody } from "@/models/user.model";
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
  try {
    const userCreateBody = new UserCreateBody(
      req.body.uid,
      req.body.name,
      req.body.introduce,
      req.body.tags
    );

    await createTagsIfNotExists(userCreateBody.tags);

    const tagIds = await findTagIdsByTagName(userCreateBody.tags);
    console.log(tagIds);

    await createUser(
      userCreateBody.uid,
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
