import { UidValidationRequestBody } from "@/models/common/UidValidationRequestBody";
import { Result } from "@/models/common/Result";
import { fetchAbsolute } from "@/utils/fetchAbsolute";
import { HarvestedCrop } from "@/models/crop/HarvestedCrop";
import { GrowingCrop } from "@/models/crop/GrowingCrop";

export class CropService {
  public getGrowingCrop = async (
    userId: string
  ): Promise<Result<GrowingCrop>> => {
    try {
      const requestBody = new UidValidationRequestBody(userId);
      const response = await fetchAbsolute(
        `api/crops/${requestBody.userId}/growing`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.ok) {
        return Result.createSuccessUsingResponseData(response);
      } else {
        return Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  };

  public getHarvestedCrops = async (
    userId: string
  ): Promise<Result<HarvestedCrop[]>> => {
    try {
      const requestBody = new UidValidationRequestBody(userId);
      const response = await fetchAbsolute(
        `api/crops?userId=${requestBody.userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.ok) {
        return Result.createSuccessUsingResponseData(response);
      } else {
        return Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  };
}
export const cropService = new CropService();
