import { Result } from "@/models/common/Result";
import { OrganizationsEmailRequestBody } from "@/models/organization/OrganizationsEmailRequestBody";
import { OrganizationsEmailJWTBody } from "@/models/organization/OrganizationsEmailJWTBody";
import { BelongOrganization } from "@/models/organization/BelongOrganization";
import { OrganizationVerifyEmailForm } from "@/models/organization/OrganizationVerifyEmailForm";
import { Organization } from "@/models/organization/Organization";
import { fetchAbsolute } from "@/utils/fetchAbsolute";

const HEADER = {
  "Content-Type": "application/json",
};

export class OrganizationService {
  public async confirmOrganizationEmailVerify(
    AccessToken: string
  ): Promise<Result<BelongOrganization>> {
    try {
      const emailConfirmBody = new OrganizationsEmailJWTBody(AccessToken);
      const response = await fetchAbsolute("api/organizations/confirmation", {
        method: "POST",
        body: JSON.stringify(emailConfirmBody),
        headers: HEADER,
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

  public async deleteBelongOrganization(
    userId: string,
    organizationId: string
  ): Promise<Result<string>> {
    try {
      const response = await fetchAbsolute(
        `api/users/${userId}/organizations/${organizationId}`,
        {
          method: "DELETE",
          headers: HEADER,
        }
      );
      if (response.ok) {
        return Result.createSuccessUsingResponseMessage(response);
      } else {
        return Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  }

  public async setOrganizationEmail(
    organizationVerifyEmailForm: OrganizationVerifyEmailForm
  ): Promise<Result<string>> {
    const { userId, userName, email, organizationId, organizationName } =
      organizationVerifyEmailForm;
    try {
      const requestBody = new OrganizationsEmailRequestBody(
        userId,
        userName,
        email,
        organizationId,
        organizationName
      );
      const response = await fetchAbsolute(
        `api/organizations/${organizationId}`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: HEADER,
        }
      );
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
  ): Promise<Result<Organization[]>> {
    try {
      const response = await fetchAbsolute(
        `api/organizations?name=${name}&page=0`,
        {
          method: "GET",
          headers: HEADER,
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
  }

  public async getBelongOrganizations(
    userId: string
  ): Promise<Result<BelongOrganization[]>> {
    try {
      const response = await fetchAbsolute(
        `api/users/${userId}/organizations`,
        {
          method: "GET",
          headers: HEADER,
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
  }
}

const organizationService = new OrganizationService();
export default organizationService;
