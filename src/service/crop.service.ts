import { UidValidationRequestBody } from "@/models/common/UidValidationRequestBody";
import { Result } from "@/models/common/Result";
import { fetchAbsolute } from "@/utils/fetchAbsolute";
import { HarvestedCrop } from "@/models/crop/HarvestedCrop";
import { GrowingCrop } from "@/models/crop/GrowingCrop";
import { CropHarvestRequestBody } from "@/models/crop/CropHarvestRequestBody";
import userId from "@/pages/users/[userId]";
import { CropCreateRequestBody } from "@/models/crop/CropCreateRequestBody";
import { CropDeleteRequestBody } from "@/models/crop/CropDeleteRequestBody";

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
      const response = await fetchAbsolute(`api/crops/${requestBody.userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        return Result.createSuccessUsingResponseData(response);
      } else {
        return Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  };

  public harvestCrop = async (userId: string, cropId: string) => {
    try {
      const requestBody = new CropHarvestRequestBody(userId, cropId);
      const response = await fetchAbsolute(
        `api/crops/${requestBody.userId}/${requestBody.cropId}`,
        {
          method: "PATCH",
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

  public plantCrop = async (userId: string, cropType: string) => {
    try {
      const requestBody = new CropCreateRequestBody(userId, cropType);
      const response = await fetchAbsolute(`api/crops`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        return Result.createSuccessUsingResponseData(response);
      } else {
        return Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  };

  public deleteCrop = async (userId: string, cropId: string) => {
    try {
      const requestBody = new CropDeleteRequestBody(userId, cropId);
      const response = await fetchAbsolute(
        `api/crops/${requestBody.userId}/${requestBody.cropId}`,
        {
          method: "DELETE",
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
