import { NextApiRequest, NextApiResponse } from "next";
import {
  NO_NAME_OR_TAG_ERROR,
  PROFILE_CREATE_SUCCESS,
} from "@/constants/message";
import {
  createTagsIfNotExists,
  findTagIdsByTagName,
} from "@/repository/tag.repository";
import { createUser } from "@/repository/user.repository";

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
      /**
       * 필수 값(이름, 태그) 체크
       */
      if (
        req.body.name === undefined ||
        req.body.name === null ||
        req.body.tags === undefined ||
        req.body.tags === null
      ) {
        res.status(400).json(NO_NAME_OR_TAG_ERROR);
        return;
      }

      try {
        /**
         * 태그 테이블에 태그 추가
         */
        await createTagsIfNotExists(req.body.tags);

        /**
         * 태그 id 검색
         */
        const tagIds = await findTagIdsByTagName(req.body.tags);

        console.log(tagIds);
        /**
         * 유저 생성
         */
        await createUser(
          req.body.uid,
          req.body.name,
          req.body.introduce,
          tagIds
        );
      } catch (e) {
        throw e;
      }
      res.status(201).json(PROFILE_CREATE_SUCCESS);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
