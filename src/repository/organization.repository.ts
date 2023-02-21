import client from "prisma/client";
import { ORGANIZATION_NUM_PER_PAGE } from "@/constants/organization.constant";

export const findOrganizations = async (pageNum: number, name?: string) => {
  return await client.organization.findMany({
    skip: pageNum * ORGANIZATION_NUM_PER_PAGE,
    take: ORGANIZATION_NUM_PER_PAGE,
    where: { name: { startsWith: name } },
    orderBy: { name: "asc" },
  });
};
