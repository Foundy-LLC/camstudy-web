import { NextApiRequest, NextApiResponse } from "next";
import {
  PROFILE_CREATE_SUCCESS,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import {
  createTagsIfNotExists,
  findTagIdsByTagName,
} from "@/repository/tag.repository";
import { createUser } from "@/repository/user.repository";
import { UserCreateBody } from "@/models/user.model";
import { string } from "prop-types";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  console.log(req.body);

  switch (method) {
    case "GET":
      break;
    case "POST":
      try {
        const userCreateBody = new UserCreateBody(
          req.body.uid,
          req.body.name,
          req.body.introduce,
          req.body.tags
        );

        await createTagsIfNotExists(userCreateBody.tags);

        const tagIds = await findTagIdsByTagName(req.body.tags);
        console.log(tagIds);

        await createUser(
          req.body.uid,
          req.body.name,
          req.body.introduce,
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
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
