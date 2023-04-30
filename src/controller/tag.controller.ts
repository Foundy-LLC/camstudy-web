import { NextApiRequest, NextApiResponse } from "next";
import {
  REQUEST_QUERY_ERROR,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import { ResponseBody } from "@/models/common/ResponseBody";
import {
  deleteTageById,
  findSimilarTags,
  findTagIdByTagName,
} from "@/repository/tag.repository";
import { TagGetRequestBody } from "@/models/welcome/TagGetRequestBody";
import {
  TAG_NOT_REGISTERED_ERROR,
  TAGS_DELETE_SUCCESS,
  TAGS_GET_SUCCESS,
} from "@/constants/tag.constant";
import { TagDeleteRequestBody } from "@/models/tag/TagDeleteRequestBody";
import { Prisma } from "@prisma/client";

export const getTags = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, page } = req.query;
  try {
    if (typeof page !== "string") throw REQUEST_QUERY_ERROR;

    const tagGetRequestBody =
      typeof name === "string"
        ? new TagGetRequestBody(page, name)
        : new TagGetRequestBody(page);

    const result = await findSimilarTags(
      tagGetRequestBody.pageNum,
      tagGetRequestBody.name
    );
    res.status(201).json(
      new ResponseBody({
        data: result,
        message: TAGS_GET_SUCCESS,
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

export const deleteTag = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, tag } = req.query;
    if (typeof userId !== "string" || typeof tag !== "string")
      throw REQUEST_QUERY_ERROR;
    const requestBody = new TagDeleteRequestBody(userId, tag);
    const tagId = await findTagIdByTagName(requestBody.tag);
    await deleteTageById(userId, tagId);
    res.status(200).json(
      new ResponseBody({
        message: TAGS_DELETE_SUCCESS,
      })
    );
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      res.status(400).send(
        new ResponseBody({
          message: TAG_NOT_REGISTERED_ERROR,
        })
      );
      return;
    }
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
  }
};
