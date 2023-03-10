import {
  ORGANIZATIONS_EMAIL_TOKEN_NULL_ERROR,
  ORGANIZATIONS_EMAIL_TYPE_ERROR,
  ORGANIZATIONS_ID_NULL_ERROR,
  ORGANIZATIONS_NAME_NULL_ERROR,
} from "@/constants/organizationMessage";

export const validateEmail = (email: string) => {
  var regEmail = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
  if (!regEmail.test(email)) throw ORGANIZATIONS_EMAIL_TYPE_ERROR;
};

export const validateOrganizationId = (organizationId: string) => {
  if (organizationId === undefined) throw ORGANIZATIONS_ID_NULL_ERROR;
};
export const validateOrganizationName = (organizationId: string) => {
  if (organizationId === undefined) throw ORGANIZATIONS_NAME_NULL_ERROR;
};

export const validateAccessToken = (AccessToken: string) => {
  if (AccessToken == null) throw ORGANIZATIONS_EMAIL_TOKEN_NULL_ERROR;
};
