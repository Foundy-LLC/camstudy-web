import { validateUid } from "@/utils/user.validator";
import { validateCropType } from "@/utils/crop.validator";
import { CropsType } from "@/models/crop/CropsType";

export class CropRequestBody {
  constructor(readonly userId: string, readonly cropType: CropsType) {
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
