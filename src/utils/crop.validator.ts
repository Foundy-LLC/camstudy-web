import {
  NO_CROP_TYPE,
  NOT_EXIST_CROP,
  NOT_EXIST_CROP_ID,
} from "@/constants/cropMessage";

const cropList = ["strawberry", "pumpkin", "carrot", "cabbage", "tomato"];
export const validateCropType = (cropType: string) => {
  if (cropType.length == 0) {
    throw NO_CROP_TYPE;
  }
  if (!cropList.includes(cropType)) {
    throw NOT_EXIST_CROP;
  }
};

export const validateCropId = (cropId: string) => {
  if (cropId.length == 0) {
    throw NOT_EXIST_CROP_ID;
  }
};
