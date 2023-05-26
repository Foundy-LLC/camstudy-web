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
  fetchGrowingCrop,
  getAverageStudyHours,
  getConsecutiveAttendanceDays,
  getExpectedAverageStudyHours,
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
  FETCH_GROWING_CROPS_SUCCESS,
  FETCH_HARVESTED_CROPS_SUCCESS,
  HARVEST_CROP_SUCCESS,
  NO_CROP_TYPE_AND_PLANTED_DATE,
  NOT_EXIST_GROWING_CROP,
  SET_CROP_SUCCESS,
} from "@/constants/cropMessage";
import { CropHarvestRequestBody } from "@/models/crop/CropHarvestRequestBody";
import { determineCropsGrade } from "@/utils/CropUtil";
import { UidValidationRequestBody } from "@/models/common/UidValidationRequestBody";
import { CropDeleteRequestBody } from "@/models/crop/CropDeleteRequestBody";
import { STANDARD_END_HOUR_OF_DAY } from "@/constants/common";
import { getCropsByType } from "@/models/crop/CropsType";
import { GrowingCrop } from "@/models/crop/GrowingCrop";
import { CropsGrade } from "@/models/crop/CropsGrade";
import { crops_type } from "@prisma/client";

export const fetchHarvestedCrops = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId } = req.query;
    if (typeof userId !== "string") throw REQUEST_QUERY_ERROR;
    const requestBody = new UidValidationRequestBody(userId);
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

    const growingCrop = await fetchGrowingCrop(reqBody.userId);
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

const getDifferenceInDays = (a: Date, b: Date): number => {
  // 두 날짜 간의 차이 (밀리초)
  const differenceInMs = Math.abs(a.getTime() - b.getTime());

  // 차이를 일(day) 단위로 변환
  return Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
};

export const getRequiredConsecutiveAttendanceDays = (
  plantedDateTime: Date,
  maxDay: number,
  currentDateTime: Date = new Date()
) => {
  const standardCurrentDateTime = shiftToStandardDate(currentDateTime);
  const standardPlantedDateTime = shiftToStandardDate(plantedDateTime);

  const standardCurrentDate = getDateWithoutTime(standardCurrentDateTime);
  const standardPlantedDate = getDateWithoutTime(standardPlantedDateTime);

  return Math.min(
    getDifferenceInDays(standardCurrentDate, standardPlantedDate),
    maxDay
  );
};

export const getDateWithoutTime = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const shiftToStandardDate = (date: Date): Date => {
  const time = date.getTime() - STANDARD_END_HOUR_OF_DAY * 60 * 60 * 1000;
  return new Date(time);
};

export const calculateCropLevel = (
  plantedAt: Date,
  requiredDay: number,
  maxLevel: number,
  currentDateTime: Date = new Date()
): number => {
  const elapsedMillis = currentDateTime.getTime() - plantedAt.getTime();
  const currentProgressPercent =
    (100.0 * elapsedMillis) / (requiredDay * 24 * 60 * 60 * 1000);
  if (currentProgressPercent >= 100) {
    return maxLevel;
  }
  const oneLevelPercent = 100.0 / maxLevel;
  return Math.floor(currentProgressPercent / oneLevelPercent) + 1;
};

// TODO: 시연용 코드임 프로덕션에서는 제거 필요!!!
export const DEMO_CROP_TYPE = crops_type.strawberry;

export const getGrowingCrop = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId } = req.query;

    if (typeof userId !== "string") throw REQUEST_QUERY_ERROR;
    const uidReqBody = new UidValidationRequestBody(userId);

    const growingCrop = await fetchGrowingCrop(uidReqBody.userId);

    if (growingCrop == null) {
      res
        .status(404)
        .send(new ResponseBody({ message: NOT_EXIST_GROWING_CROP }));
      return;
    }

    // TODO: 시연용 코드임 프로덕션에서는 제거 필요!!!
    if (growingCrop.type === DEMO_CROP_TYPE) {
      const cropDto = getCropsByType(growingCrop.type);
      const data: GrowingCrop = {
        id: growingCrop.id,
        ownerId: growingCrop.user_id,
        type: growingCrop.type,
        level: cropDto.imageUrls.length,
        expectedGrade: CropsGrade.GOLD,
        isDead: false,
        plantedAt: growingCrop.planted_at,
        averageStudyTimes: 60 * 5 + 12,
      };
      res.status(200).json(
        new ResponseBody({
          data: data,
          message: FETCH_GROWING_CROPS_SUCCESS,
        })
      );
      return;
    }
    // --------- End of the 시연 코드 ---------

    const cropReqBody = new CropHarvestRequestBody(userId, growingCrop.id);

    const cropDto = getCropsByType(growingCrop.type);

    const requireConsecutiveAttendanceDays =
      getRequiredConsecutiveAttendanceDays(
        growingCrop.planted_at,
        cropDto.requireDay
      );

    const averageStudyTimes = await getExpectedAverageStudyHours(
      cropReqBody.userId,
      growingCrop.planted_at,
      requireConsecutiveAttendanceDays
    );

    const expectedGrade = determineCropsGrade(averageStudyTimes);

    const consecutiveAttendanceDay = await getConsecutiveAttendanceDays(
      userId,
      growingCrop.planted_at,
      requireConsecutiveAttendanceDays
    );

    const isDead = requireConsecutiveAttendanceDays > consecutiveAttendanceDay;

    const level = calculateCropLevel(
      growingCrop.planted_at,
      cropDto.requireDay,
      cropDto.imageUrls.length
    );

    const data: GrowingCrop = {
      id: growingCrop.id,
      ownerId: growingCrop.user_id,
      type: cropDto.type,
      level: level,
      expectedGrade: expectedGrade,
      isDead: isDead,
      plantedAt: growingCrop.planted_at,
      averageStudyTimes: averageStudyTimes,
    };

    res.status(200).json(
      new ResponseBody({
        data: data,
        message: FETCH_GROWING_CROPS_SUCCESS,
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
    return;
  }
};

export const deleteGrowingCrop = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId, cropId } = req.query;
    if (typeof userId !== "string" || typeof cropId !== "string") {
      throw REQUEST_QUERY_ERROR;
    }
    const reqBody = new CropDeleteRequestBody(userId, cropId);

    const growingCrop = await fetchGrowingCrop(reqBody.userId);
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
    const { userId, cropId } = req.query;
    if (typeof userId !== "string" || typeof cropId !== "string") {
      throw REQUEST_QUERY_ERROR;
    }
    const reqBody = new CropHarvestRequestBody(userId, cropId);

    const growingCrop = await fetchGrowingCrop(reqBody.userId);
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

    // TODO: 시연용 코드임 프로덕션에서는 제거 필요!!!
    if (growingCrop.type === DEMO_CROP_TYPE) {
      await harvestCrop(reqBody, CropsGrade.GOLD);
      res.status(200).json(new ResponseBody({ message: HARVEST_CROP_SUCCESS }));
      return;
    }
    // --------- End of the 시연 코드 ---------

    const targetCrop = getCropsByType(targetCropTypeAndPlantedDate.type);

    const plantedAt = targetCropTypeAndPlantedDate.planted_at;
    const currentDate = new Date();
    const isPossibleToHarvest: boolean =
      (currentDate.getTime() - plantedAt.getTime()) / (1000 * 60 * 60 * 24) >
      targetCrop.requireDay;

    if (!isPossibleToHarvest) {
      throw CAN_NOT_HARVEST_CROP_YET;
    }

    const consecutiveAttendanceDays = await getConsecutiveAttendanceDays(
      reqBody.userId,
      plantedAt,
      targetCrop.requireDay
    );

    if (consecutiveAttendanceDays !== targetCrop.requireDay) {
      throw CROP_DEAD;
    }

    const averageStudyTimes = await getAverageStudyHours(
      reqBody,
      plantedAt,
      targetCrop.requireDay
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
