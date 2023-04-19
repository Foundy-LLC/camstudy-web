import { CROPS, Crops } from "@/constants/crops";
import { NOT_EXIST_CROP } from "@/constants/cropMessage";
import { crops_type } from "@prisma/client";

export const getCropsByType = (type: crops_type): Crops => {
  const crop = CROPS.find((crop) => crop.type === type);
  if (crop == null) {
    throw NOT_EXIST_CROP;
  }
  return crop;
};
