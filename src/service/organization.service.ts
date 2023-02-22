import { Result } from "@/models/common/Result";
import { organization } from "@prisma/client";
import { OrganizationsEmailRequestBody } from "@/models/organization/OrganizationsEmailRequestBody";

const HEADER = {
  "Content-Type": "application/json",
};

export class OrganizationService {
  public async setOrganizationEmail(
    userId: string,
    userName: string,
    email: string,
    organizationId: string
  ): Promise<Result<string>> {
    try {
      const requestBody = new OrganizationsEmailRequestBody(
        userId,
        userName,
        email,
        organizationId
      );
      const response = await fetch(`api/organizations/${organizationId}`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: HEADER,
      });
      if (response.ok) {
        return Result.createSuccessUsingResponseMessage(response);
      } else {
        return Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  }

  public async getSimilarOrganizations(
    name: string
  ): Promise<Result<organization[]>> {
    try {
      const response = await fetch(`api/organizations?name=${name}&page=0`, {
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
