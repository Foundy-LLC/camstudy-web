import { NextPage } from "next";
import { observer } from "mobx-react";
import { useStores } from "@/stores/context";
import React, { useEffect, useState } from "react";
import { useDebounce } from "@/components/UseDebounce";
import { BelongOrganization, Organization } from "@/stores/OrganizationStore";
import Image from "next/image";

const BelongOrganizationsName: NextPage<{ item: BelongOrganization }> =
  observer(({ item }) => {
    const { organizationStore } = useStores();
    const { organizationName } = item;
    return (
      <>
        <h3 style={{ display: "inline" }}>{organizationName}</h3>
        <Image
          src={
            "https://uxwing.com/wp-content/themes/uxwing/download/checkmark-cross/red-x-icon.png"
          }
          width={13}
          height={13}
          alt="locked"
          onClick={() => {
            if (
              confirm(`"${organizationName}"을 소속에서 삭제하시겠습니까?`) ===
              true
            ) {
              organizationStore.deleteBelongOrganization(item);
              console.log(`${organizationName}가(이) 소속에서 삭제되었습니다`);
            } else return;
          }}
        />
        <br />
      </>
    );
  });

const BelongOrganizationsNameGroup: NextPage<{ items: BelongOrganization[] }> =
  observer(({ items }) => {
    return (
      <>
        {items.map((item, key) => (
          <BelongOrganizationsName item={item} key={key} />
        ))}
      </>
    );
  });

const RecommendedOrganizationsNameGroup: NextPage<{ items: Organization[] }> =
  observer(({ items }) => {
    return (
      <>
        {items.map((item, key) => (
          <RecommendedOrganizationsName item={item} key={key} />
        ))}
      </>
    );
  });

const RecommendedOrganizationsName: NextPage<{ item: Organization }> = observer(
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
        <button onClick={() => organizationStore.fetchBelongOrganizations()}>
          내 소속 조회
        </button>
      </div>
      <RecommendedOrganizationsNameGroup
        items={organizationStore.recommendOrganizations}
      />
      {organizationStore.successMessage === undefined ? null : (
        <h2>{organizationStore.successMessage}</h2>
      )}
      {organizationStore.errorMessage === undefined ? null : (
        <h2>Error: {organizationStore.errorMessage}</h2>
      )}
      <BelongOrganizationsNameGroup
        items={
          organizationStore.belongOrganizations
            ? organizationStore.belongOrganizations
            : []
        }
      />
    </>
  );
});

export default organizations;
