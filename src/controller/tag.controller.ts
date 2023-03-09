import { NextApiRequest, NextApiResponse } from "next";
import {
  REQUEST_QUERY_ERROR,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import { ResponseBody } from "@/models/common/ResponseBody";
import { findSimilarTags } from "@/repository/tag.repository";
import { TagGetRequestBody } from "@/models/welcome/TagGetRequestBody";
import { TAGS_GET_SUCCESS } from "@/constants/tag.constant";

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
