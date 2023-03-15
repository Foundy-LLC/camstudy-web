import { NextApiRequest, NextApiResponse } from "next";
import { CropRequestBody } from "@/models/crop/CropRequestBody";
import { ResponseBody } from "@/models/common/ResponseBody";
import { SERVER_INTERNAL_ERROR_MESSAGE } from "@/constants/message";
import { createCrop, isExistGrowingCrop } from "@/repository/crop.repository";
import { ALREADY_EXIST_CROP, SET_CROP_SUCCESS } from "@/constants/cropMessage";

export const setCrop = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, cropType } = req.body;
    const reqBody = new CropRequestBody(userId, cropType);

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
