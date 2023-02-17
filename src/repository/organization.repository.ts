import { OrganizationsSearchRequestBody } from "@/models/organization/OrganizationsSearchRequestBody";
import { OrganizationsGetRequestBody } from "@/models/organization/OrganizationsGetRequestBody";
import { ResponseBody } from "@/models/common/ResponseBody";
import { REQUEST_QUERY_ERROR } from "@/constants/message";
import client from "../../prisma/client";
import { ROOM_NUM_PER_PAGE } from "@/constants/room.constant";
import { ORGANIZATION_NUM_PER_PAGE } from "@/constants/organization.constant";

export const separateOrganizationsRequests = (
  query: Partial<{
    [key: string]: string | string[];
  }>
) => {
  const { name, page } = query;
  if (typeof name !== "string" && typeof page !== "string") {
    throw REQUEST_QUERY_ERROR;
  }
  if (typeof name === "string") {
    return new OrganizationsSearchRequestBody(name);
  } else return new OrganizationsGetRequestBody(page as string);
};

export const findOrganizations = async (
  RequestBody: OrganizationsSearchRequestBody | OrganizationsGetRequestBody
) => {
  if (RequestBody instanceof OrganizationsSearchRequestBody) {
    // 유사 이름 추천 인 경우
    return await client.organization.findMany({
      where: { name: { startsWith: RequestBody.name } },
    });
  } else {
    return await client.organization.findMany({
      skip: RequestBody.pageNum * ORGANIZATION_NUM_PER_PAGE,
      take: ORGANIZATION_NUM_PER_PAGE,
    });
  }
};
