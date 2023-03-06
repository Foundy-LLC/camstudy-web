import client from "prisma/client";
import { ORGANIZATION_NUM_PER_PAGE } from "@/constants/organization.constant";
import { belong, organization } from "@prisma/client";
import { BelongOrganization, Organization } from "@/stores/OrganizationStore";
import { async } from "@firebase/util";

export const updateEmailVerifyStatus = async (
  userId: string,
  organizationId: string
): Promise<belong> => {
  return await client.belong.update({
    where: {
      user_id_organization_id: {
        user_id: userId,
        organization_id: organizationId,
      },
    },
    data: { is_authenticated: true },
  });
};

export const verifyBelong = async (
  userId: string,
  organizationId: string
): Promise<boolean> => {
  const result = await client.belong.findUnique({
    where: {
      user_id_organization_id: {
        user_id: userId,
        organization_id: organizationId,
      },
    },
  });
  if (result === null) return false;
  else return true;
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

export const deleteBelong = async (userId: string, organizationId: string) => {
  await client.belong.delete({
    where: {
      user_id_organization_id: {
        user_id: userId,
        organization_id: organizationId,
      },
    },
  });
};

export const findOrganizations = async (
  pageNum: number,
  name?: string
): Promise<Organization[]> => {
  return await client.organization.findMany({
    skip: pageNum * ORGANIZATION_NUM_PER_PAGE,
    take: ORGANIZATION_NUM_PER_PAGE,
    where: { name: { startsWith: name } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, address: true },
  });
};

export const findBelongOrganizations = async (
  userId: string
): Promise<BelongOrganization[]> => {
  const result = await client.belong.findMany({
    where: {
      user_id: userId,
      is_authenticated: true,
    },
    orderBy: { organization_id: "asc" },
    select: { organization: { select: { id: true, name: true } } },
  });
  return result.map((item) => {
    const { organization } = item;
    return {
      userId: userId,
      organizationId: organization.id,
      organizationName: organization.name,
    };
  });
};
