import { RoomService } from "@/service/room.service";
import { Result } from "@/models/common/Result";
import { organization } from "@prisma/client";

export class OrganizationService {
  public async getSimilarOrganizations(
    name: string
  ): Promise<Result<organization[]>> {
    try {
      const response = await fetch(`api/organizations?name=${name}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        return Result.createSuccessUsingResponseData(response);
      } else {
        return Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  }
}
const organizationService = new OrganizationService();
export default organizationService;
