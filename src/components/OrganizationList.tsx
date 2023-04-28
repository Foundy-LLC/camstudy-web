import { NextPage } from "next";
import { observer } from "mobx-react";
import { useStores } from "@/stores/context";
import { useEffect } from "react";
import { BelongOrganization } from "@/models/organization/BelongOrganization";

const BelongOrganizationsName: NextPage<{ item: BelongOrganization }> =
  observer(({ item }) => {
    return (
      <div
        style={{
          border: "1px solid #FFC01F",
          borderRadius: "24px",
          marginRight: "8px",
        }}
      >
        <label style={{ padding: "12px" }}>{item.organizationName}</label>
      </div>
    );
  });

export const OrganizationList: NextPage = observer(() => {
  const { organizationStore, userStore } = useStores();
  useEffect(() => {
    if (!userStore.currentUser) return;
    organizationStore.fetchBelongOrganizations();
  }, [userStore.currentUser]);
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {organizationStore.belongOrganizations &&
        organizationStore.belongOrganizations.map((organization) => (
          <BelongOrganizationsName
            item={organization}
            key={organization.organizationId}
          />
        ))}
    </div>
  );
});
