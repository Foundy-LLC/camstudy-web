import { validateUid } from "@/utils/user.validator";
import { validateCropType } from "@/utils/crop.validator";

export class CropCreateRequestBody {
  constructor(readonly userId: string, readonly cropType: string) {
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
