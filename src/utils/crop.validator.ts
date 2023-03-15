import { NO_CROP_TYPE, NOT_EXIST_CROP } from "@/constants/cropMessage";

const cropList = ["strawberry", "pumpkin", "carrot", "cabbage", "tomato"];
export const validateCropType = (cropType: string) => {
  if (cropType.length == 0) {
    throw NO_CROP_TYPE;
  }
  if (!cropList.includes(cropType)) {
    throw NOT_EXIST_CROP;
  }
};
