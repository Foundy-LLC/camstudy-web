import { uuidv4 } from "@firebase/util";
import { CropCreateRequestBody } from "@/models/crop/CropCreateRequestBody";
import prisma from "../../prisma/client";
import { CropDeleteRequestBody } from "@/models/crop/CropDeleteRequestBody";
import { Crop } from "@/models/crop/Crop";

export const getHarvestedCrops = async (userId: string): Promise<Crop[]> => {
  const harvestedCrops = await prisma.crops.findMany({
    where: {
      user_id: userId,
      harvested_at: {
        not: null,
      },
    },
    orderBy: {
      harvested_at: "desc",
    },
  });
  return harvestedCrops.map((crop) => {
    return {
      type: crop.type,
      grade: crop.grade!,
    };
  });
};

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
