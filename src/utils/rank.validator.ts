import {
  BELONG_ORGANIZATION_ID_NOT_INCLUEDED,
  BELONG_ORGANIZATION_NULL_ERROR,
} from "@/constants/organizationMessage";
import { useStores } from "@/stores/context";

export const ValidateRankOrganizationId = (organizationId: string) => {
  const { organizationStore } = useStores();
  if (!organizationStore.belongOrganizations) {
    throw BELONG_ORGANIZATION_NULL_ERROR;
  }
  const result = organizationStore.belongOrganizations.filter(
    (organization) => organization.organizationId === organizationId
  );
  if (result.length === 0) throw BELONG_ORGANIZATION_ID_NOT_INCLUEDED;
};
