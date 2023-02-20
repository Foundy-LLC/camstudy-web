import {
  ORGANIZATIONS_NAME_NULL_ERROR,
  ORGANIZATIONS_PAGE_NUM_NULL_ERROR,
} from "@/constants/organizationMessage";

export const validateOrganizationName = (organizationName: string) => {
  if (!organizationName) {
    throw ORGANIZATIONS_NAME_NULL_ERROR;
  }
};

export const validateOrganizationsPageNum = (pageNum: number | null) => {
  if (pageNum === null) {
    throw ORGANIZATIONS_PAGE_NUM_NULL_ERROR;
  }
};
