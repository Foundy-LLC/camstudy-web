import { NextPage } from "next";
import { observer } from "mobx-react";
import userStyles from "@/styles/searchUser.module.scss";
import React from "react";
import { useStores } from "@/stores/context";

export const NoneButton: NextPage<{
  userId: string;
  name: string;
}> = observer(({ userId, name }) => {
  const { friendStore } = useStores();
  return (
    <>
      <button
        className={`${userStyles["user-add-friend__button"]}`}
        onClick={async () => {
          if (confirm(`${name}님에게 친구 요청을 보내시겠어요?`) === true) {
            await friendStore.sendFriendRequest(userId);
          }
        }}
      >
        <span className="material-symbols-sharp">person_add</span>
      </button>
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
