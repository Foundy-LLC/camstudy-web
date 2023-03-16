import { uuidv4 } from "@firebase/util";
import { CropCreateRequestBody } from "@/models/crop/CropCreateRequestBody";
import prisma from "../../prisma/client";
import { CropDeleteRequestBody } from "@/models/crop/CropDeleteRequestBody";

export const isExistGrowingCrop = async (userId: string) => {
  const growingCrops = await prisma.crops.findMany({
    where: {
      user_id: userId,
      harvested_at: null,
    },
  });
  return growingCrops.length !== 0;
};

export const createCrop = async (body: CropCreateRequestBody) => {
  await prisma.crops.create({
    data: {
      id: uuidv4(),
      user_id: body.userId,
      type: body.cropType,
      planted_at: new Date(),
      harvested_at: null,
      grade: null,
    },
  });
};

export const deleteCrop = async (body: CropDeleteRequestBody) => {
  await prisma.crops.delete({
    where: {
      id_user_id: {
        user_id: body.userId,
        id: body.cropId,
      },
    },
  });
};
