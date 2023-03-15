import { uuidv4 } from "@firebase/util";
import { CropRequestBody } from "@/models/crop/CropRequestBody";
import prisma from "../../prisma/client";

export const isExistCrop = async (userId: string) => {
  const isExist = await prisma.crops.findMany({
    where: {
      user_id: userId,
      harvested_at: null,
    },
  });
  return isExist.length != 0;
};

export const createCrop = async (body: CropRequestBody) => {
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
