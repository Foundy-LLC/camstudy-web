import {
  ORGANIZATIONS_EMAIL_TYPE_ERROR,
  ORGANIZATIONS_ID_NULL_ERROR,
  ORGANIZATIONS_NAME_NULL_ERROR,
  ORGANIZATIONS_PAGE_NULL_ERROR,
  ORGANIZATIONS_PAGE_NUM_NULL_ERROR,
} from "@/constants/organizationMessage";

export const validateOrganizationsPage = (page: string) => {
  if (page === "") {
    throw ORGANIZATIONS_PAGE_NULL_ERROR;
  }
};

export const validateOrganizationsPageNum = (pageNum: number | null) => {
  if (pageNum === null) {
    throw ORGANIZATIONS_PAGE_NUM_NULL_ERROR;
  }
};

export const validateEmail = (email: string) => {
  if (email.search("@") === -1) throw ORGANIZATIONS_EMAIL_TYPE_ERROR;
};
export const validateOrganizationId = (organizationId: string) => {
  if (organizationId === undefined) throw ORGANIZATIONS_ID_NULL_ERROR;
};
