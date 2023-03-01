import { NextPage } from "next";
import { observer } from "mobx-react";
import { useStores } from "@/stores/context";

const organizations: NextPage = observer(() => {
  const { friendStore } = useStores();
  return (
    <>
      <input
        type="text"
        placeholder="유저 아이디"
        onChange={(e) => {
          const value = e.target.value;
          if (value) friendStore.changeFriendRequestInput(value);
          console.log(friendStore.friendRequestInput);
        }}
      ></input>
      <button
        onClick={(e) => {
          friendStore.sendFriendRequest();
        }}
      >
        친구 요청 전송
      </button>
      {friendStore.successMessage ? (
        <h3>{friendStore.successMessage}</h3>
      ) : null}
      {friendStore.errorMessage ? <h3>{friendStore.errorMessage}</h3> : null}
    </>
  );
});
export default organizations;
