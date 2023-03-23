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
  getAverageStudyTime,
  getConsecutiveAttendanceDays,
  getGrowingCrop,
  getHarvestedCrops,
  getTargetCropTypeAndPlantedDate,
  harvestCrop,
} from "@/repository/crop.repository";
import {
  ALREADY_EXIST_CROP,
  CAN_NOT_HARVEST_CROP_YET,
  CROP_DEAD,
  CROP_ID_DOES_NOT_MATCH,
  DELETE_CROP_SUCCESS,
  FETCH_HARVESTED_CROPS_SUCCESS,
  HARVEST_CROP_SUCCESS,
  NO_CROP_TYPE_AND_PLANTED_DATE,
  NOT_EXIST_CROP,
  NOT_EXIST_GROWING_CROP,
  SET_CROP_SUCCESS,
} from "@/constants/cropMessage";
import { CropHarvestRequestBody } from "@/models/crop/CropHarvestRequestBody";
import { CROPS } from "@/constants/crops";
import { determineCropsGrade } from "@/utils/CropUtil";
import { ValidateUid } from "@/models/common/ValidateUid";
import { CropDeleteRequestBody } from "@/models/crop/CropDeleteRequestBody";

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

    const growingCrop = await getGrowingCrop(reqBody.userId);
    if (growingCrop != null) {
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

    const growingCrop = await getGrowingCrop(reqBody.userId);
    if (growingCrop == null) {
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

export const harvestGrowingCrop = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId, cropId } = req.body;
    const reqBody = new CropHarvestRequestBody(userId, cropId);

    const growingCrop = await getGrowingCrop(reqBody.userId);
    if (growingCrop == null) {
      throw NOT_EXIST_GROWING_CROP;
    }

    if (growingCrop.id !== reqBody.cropId) {
      throw CROP_ID_DOES_NOT_MATCH;
    }

    const targetCropTypeAndPlantedDate = await getTargetCropTypeAndPlantedDate(
      reqBody
    );

    if (targetCropTypeAndPlantedDate == null) {
      throw NO_CROP_TYPE_AND_PLANTED_DATE;
    }

    const targetCropType = CROPS.find(
      (crop) => crop.type === targetCropTypeAndPlantedDate.type
    );

    if (targetCropType == null) {
      throw NOT_EXIST_CROP;
    }

    const plantedAt = targetCropTypeAndPlantedDate.planted_at;
    const currentDate = new Date();
    const isPossibleToHarvest: boolean =
      (currentDate.getTime() - plantedAt.getTime()) / (1000 * 60 * 60 * 24) >
      targetCropType.requireDay;

    if (!isPossibleToHarvest) {
      throw CAN_NOT_HARVEST_CROP_YET;
    }

    const consecutiveAttendanceDays = await getConsecutiveAttendanceDays(
      reqBody.userId,
      plantedAt,
      targetCropType.requireDay
    );

    if (consecutiveAttendanceDays !== targetCropType.requireDay) {
      throw CROP_DEAD;
    }

    const averageStudyTimes = await getAverageStudyTime(
      reqBody,
      plantedAt,
      targetCropType.requireDay
    );

    const grade = determineCropsGrade(averageStudyTimes);

    await harvestCrop(reqBody, grade);

    res.status(200).json(new ResponseBody({ message: HARVEST_CROP_SUCCESS }));
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
