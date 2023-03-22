import { ValidateUid } from "@/models/common/ValidateUid";
import { Result } from "@/models/common/Result";
import { fetchAbsolute } from "@/utils/fetchAbsolute";
import { Crop } from "@/models/crop/Crop";

export class CropService {
  public getHarvestedCrops = async (
    userId: string
  ): Promise<Result<Crop[]>> => {
    try {
      const requestBody = new ValidateUid(userId);
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
