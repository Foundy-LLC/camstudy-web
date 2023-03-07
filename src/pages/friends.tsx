import { NextPage } from "next";
import { observer } from "mobx-react";
import { useStores } from "@/stores/context";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import userStore from "@/stores/UserStore";
import { UserSearchOverview } from "@/models/user/UserSearchOverview";

const SimilarNamedUser: NextPage<{ item: UserSearchOverview }> = observer(
  ({ item }) => {
    const [selected, setSelected] = useState<string | undefined>(undefined);
    const [statusImage, setStatusImage] = useState<string>(
      "https://uxwing.com/wp-content/themes/uxwing/download/user-interface/add-plus-icon.png"
    );
    const { friendStore } = useStores();
    const { name, id } = item;
    useEffect(() => {
      // 요청한 기록이 없는 경우 "none"
      if (item.requestHistory.length === 0) {
        setSelected("none");
        return;
      }
      // 이미 친구인 경우
      item.requestHistory.map((value) => {
        if (value.accepted === true) setSelected("accepted");
      });
      if (selected !== undefined) return;
      //요청했으나 수락되지 않은 경우
      setSelected("requested");
    }, [item]);

    useEffect(() => {
      if (selected === "accepted") {
        setStatusImage(
          "https://uxwing.com/wp-content/themes/uxwing/download/checkmark-cross/blue-check-mark-icon.png"
        );
      } else if (selected === "requested") {
        setStatusImage(
          "https://uxwing.com/wp-content/themes/uxwing/download/festival-culture-religion/cracker-color-icon.png"
        );
      } else {
        setStatusImage(
          "https://uxwing.com/wp-content/themes/uxwing/download/user-interface/add-plus-icon.png"
        );
      }
    }, [selected]);
    return (
      <>
        <h3 style={{ display: "inline" }}>{name}</h3>{" "}
        <i>#{id.substring(0, 5)}&nbsp;</i>
        {userStore.currentUser!.id !== id && (
          <>
            <Image
              src={statusImage}
              width={18}
              height={18}
              alt="select"
              onClick={async () => {
                await friendStore.sendFriendRequest(id);
                setSelected("requested");
              }}
            />
            <br />
          </>
        )}
      </>
    );
  }
);

const SimilarNamedUserGroup: NextPage<{ items: UserSearchOverview[] }> =
  observer(({ items }) => {
    return (
      <>
        {items.map((item, key) => (
          <SimilarNamedUser item={item} key={key} />
        ))}
      </>
    );
  });

const friends: NextPage = observer(() => {
  const { friendStore } = useStores();
  const keyPressed = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.charCode === 13) friendStore.getSimilarNamedUsers();
  };
  return (
    <>
      <input
        type="text"
        placeholder="유저 아이디"
        onChange={(e) => {
          const value = e.target.value;
          if (value) friendStore.changeFriendRequestInput(value);
        }}
        onKeyPress={(event) => keyPressed(event)}
      ></input>
      <button
        onClick={(e) => {
          friendStore.getSimilarNamedUsers();
        }}
      >
        유저 조회
      </button>
      <br />
      {friendStore.successMessage ? (
        <h3>{friendStore.successMessage}</h3>
      ) : null}
      {friendStore.errorMessage ? <h3>{friendStore.errorMessage}</h3> : null}
      <SimilarNamedUserGroup items={friendStore.userSearchOverviews} />
    </>
  );
});
export default friends;
