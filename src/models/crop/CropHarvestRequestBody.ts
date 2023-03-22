import { validateUid } from "@/utils/user.validator";
import { validateCropId } from "@/utils/crop.validator";

export class CropHarvestRequestBody {
  constructor(readonly userId: string, readonly cropId: string) {
    this._validateUserId();
    this._validateCropId();
  }

  private _validateUserId = () => {
    validateUid(this.userId);
  };

  private _validateCropId = () => {
    validateCropId(this.cropId);
  };
}
