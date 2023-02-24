import client from "prisma/client";
import { ORGANIZATION_NUM_PER_PAGE } from "@/constants/organization.constant";

export const updateEmailVerifyStatus = async (
  userId: string,
  organizationId: string
) => {
  await client.belong.update({
    where: {
      user_id_organization_id: {
        user_id: userId,
        organization_id: organizationId,
      },
    },
    data: { is_authenticated: true },
  });
};

export const addOrganizationEmailVerify = async (
  userId: string,
  email: string,
  organizationId: string
) => {
  await client.belong.create({
    data: {
      user_id: userId,
      organization_id: organizationId,
      email: email,
      is_authenticated: false,
    },
  });
};

export const findOrganizations = async (pageNum: number, name?: string) => {
  return await client.organization.findMany({
    skip: pageNum * ORGANIZATION_NUM_PER_PAGE,
    take: ORGANIZATION_NUM_PER_PAGE,
    where: { name: { startsWith: name } },
    orderBy: { name: "asc" },
  });
};
