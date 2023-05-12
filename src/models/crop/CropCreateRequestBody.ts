import { validateUid } from "@/utils/user.validator";
import { validateCropType } from "@/utils/crop.validator";
import { crops_type } from "@prisma/client";

export class CropCreateRequestBody {
  constructor(readonly userId: string, readonly cropType: crops_type) {
    this._validateUserId();
    this._validateCropType();
  }

  private _validateUserId = () => {
    validateUid(this.userId);
  };

  private _validateCropType = () => {
    validateCropType(this.cropType);
  };
}
