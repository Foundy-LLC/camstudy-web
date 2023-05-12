import { NextPage } from "next";
import { observer } from "mobx-react";
import { useStores } from "@/stores/context";
import React, { useEffect, useState } from "react";
import organizationButtonStyles from "@/styles/organizationSelectButton.module.scss";

export const OrganizationSelectButton: NextPage = observer(() => {
  const { organizationStore, userStore, rankStore } = useStores();
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    if (!userStore.currentUser) return;
    organizationStore.fetchBelongOrganizations();
  }, [userStore.currentUser]);

  useEffect(() => {
    if (!selected) rankStore.setSelectedOrganizationId(undefined);
    else rankStore.setSelectedOrganizationId(selected);

    rankStore.getRank();
    rankStore.getUserTotalRank(userStore.currentUser!.id);
  }, [selected]);

  return (
    <>
      <div
        className={`${organizationButtonStyles["organization-button-form"]} typography__text--small`}
      >
        <div
          className={`${
            organizationButtonStyles[
              `organization-button${selected === "" ? "--selected" : ""}`
            ]
          }`}
          onClick={() => {
            setSelected("");
          }}
        >
          {selected === "" && (
            <span className="material-symbols-sharp">done</span>
          )}
          <label>모두</label>
        </div>
        {organizationStore.belongOrganizations &&
          organizationStore.belongOrganizations.map((organization, key) => (
            <div
              className={`${
                organizationButtonStyles[
                  `organization-button${
                    organization.organizationId === selected ? "--selected" : ""
                  }`
                ]
              }`}
              key={key}
              onClick={() => {
                setSelected(
                  organizationStore.belongOrganizations![key].organizationId
                );
              }}
            >
              {selected === organization.organizationId && (
                <span className="material-symbols-sharp">done</span>
              )}
              <label>{organization.organizationName}</label>
            </div>
          ))}
      </div>
      <style jsx>
        {`
          .material-symbols-sharp {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24;
          }
        `}
      </style>
    </>
  );
});
