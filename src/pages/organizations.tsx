import { NextPage } from "next";
import { observer } from "mobx-react";
import { useStores } from "@/stores/context";
import React, { useEffect, useState } from "react";
import { organization } from "@prisma/client";
import { useDebounce } from "@/components/UseDebounce";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/service/firebase";

const RecommendedOrganizationsNameGroup: NextPage<{ items: organization[] }> =
  observer(({ items }) => {
    return (
      <>
        {items.map((item, key) => (
          <RecommendedOrganizationsName item={item} key={key} />
        ))}
      </>
    );
  });

const RecommendedOrganizationsName: NextPage<{ item: organization }> = observer(
  ({ item }) => {
    const { organizationStore } = useStores();
    return (
      <p
        onClick={(e) => {
          const text = e.target as HTMLElement;
          const input = document.getElementById(
            "organization-name-input"
          ) as HTMLInputElement;
          organizationStore.onChangeNameInput(text.innerHTML);
          input!.value = organizationStore.typedName;
          organizationStore.setEmailVerifyButtonDisable(
            organizationStore.checkIfNameIncluded() === undefined
          );
        }}
      >
        {item.name}
      </p>
    );
  }
);

const organizations: NextPage = observer(() => {
  const { organizationStore } = useStores();
  const [searchInput, setSearchInput] = useState("");
  const debounceSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    if (debounceSearch) {
      organizationStore.onChangeNameInput(debounceSearch);
      organizationStore.setEmailVerifyButtonDisable(
        organizationStore.checkIfNameIncluded() === undefined
      );
    }
  }, [debounceSearch]);

  return (
    <>
      <div>
        <input
          id="organization-name-input"
          type="text"
          placeholder="소속명"
          onChange={async (e) => {
            setSearchInput(e.target.value);
          }}
        ></input>
        <br />
        <input
          id="organization-email-input"
          type="email"
          placeholder="email"
          onChange={(e) => {
            organizationStore.onChangeEmailInput(e.target.value);
          }}
        ></input>
        <button
          disabled={organizationStore.emailVerityButtonDisable}
          onClick={() => organizationStore.sendOrganizationVerifyEmail()}
        >
          이메일 등록
        </button>
      </div>
      <RecommendedOrganizationsNameGroup
        items={organizationStore.recommendOrganizations}
      />
      {organizationStore.successMessage === "" ? null : (
        <h2>{organizationStore.successMessage}</h2>
      )}
      {organizationStore.errorMessage === "" ? null : (
        <h2>Error: {organizationStore.errorMessage}</h2>
      )}
    </>
  );
});

export default organizations;
