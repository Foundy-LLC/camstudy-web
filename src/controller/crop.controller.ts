import { NextApiRequest, NextApiResponse } from "next";
import { CropCreateRequestBody } from "@/models/crop/CropCreateRequestBody";
import { ResponseBody } from "@/models/common/ResponseBody";
import {
  REQUEST_QUERY_ERROR,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import {
  createCrop,
  deleteCrop,
  getHarvestedCrops,
  isExistGrowingCrop,
} from "@/repository/crop.repository";
import {
  ALREADY_EXIST_CROP,
  DELETE_CROP_SUCCESS,
  FETCH_HARVESTED_CROPS_SUCCESS,
  NOT_EXIST_CROP,
  NOT_EXIST_GROWING_CROP,
  SET_CROP_SUCCESS,
} from "@/constants/cropMessage";
import { CropDeleteRequestBody } from "@/models/crop/CropDeleteRequestBody";
import { ValidateUid } from "@/models/common/ValidateUid";

export const fetchHarvestedCrops = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId } = req.query;
    if (typeof userId !== "string") throw REQUEST_QUERY_ERROR;
    const requestBody = new ValidateUid(userId);
    const harvestedCrops = await getHarvestedCrops(requestBody.userId);
    res.status(200).send(
      new ResponseBody({
        message: FETCH_HARVESTED_CROPS_SUCCESS,
        data: harvestedCrops,
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

export const setCrop = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, cropType } = req.body;
    const reqBody = new CropCreateRequestBody(userId, cropType);

    const isExist = await isExistGrowingCrop(reqBody.userId);
    if (isExist) {
      throw ALREADY_EXIST_CROP;
    }

    await createCrop(reqBody);

    res.status(200).json(new ResponseBody({ message: SET_CROP_SUCCESS }));
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

export const deleteGrowingCrop = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId, cropId } = req.body;
    const reqBody = new CropDeleteRequestBody(userId, cropId);

    const isExist = await isExistGrowingCrop(reqBody.userId);
    if (!isExist) {
      throw NOT_EXIST_GROWING_CROP;
    }

    await deleteCrop(reqBody);

    res.status(200).json(new ResponseBody({ message: DELETE_CROP_SUCCESS }));
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
