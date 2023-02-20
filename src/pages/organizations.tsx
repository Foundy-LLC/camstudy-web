import { NextPage } from "next";
import { observer } from "mobx-react";
import { useStores } from "@/stores/context";
import React, { useEffect, useState } from "react";
import { organization } from "@prisma/client";
import { useDebounce } from "@/components/UseDebounce";

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
          input!!.value = organizationStore.typedName;
        }}
      >
        {item.name}
      </p>
    );
  }
);

const organizations: NextPage = observer(() => {
  const { organizationStore } = useStores();
  const [searchTerm, setSearchTerm] = useState("");
  const debounceSearch = useDebounce(searchTerm, 500);

  useEffect(
    () => {
      if (debounceSearch) {
        organizationStore.onChangeNameInput(debounceSearch);
      }
    },
    [debounceSearch] // Only call effect if debounced search term changes
  );

  return (
    <>
      <div>
        <input
          id="organization-name-input"
          type="text"
          placeholder="소속명"
          onChange={async (e) => {
            setSearchTerm(e.target.value);
          }}
        ></input>
        <button>등록</button>
        {/*{organizationStore.recommendOrganizations &&*/}
        {/*  organizationStore.recommendOrganizations.map((name) => {*/}
        {/*    return <p>{name}</p>;*/}
        {/*  })}*/}
      </div>
      <RecommendedOrganizationsNameGroup
        items={organizationStore.recommendOrganizations}
      />
    </>
  );
});

export default organizations;
