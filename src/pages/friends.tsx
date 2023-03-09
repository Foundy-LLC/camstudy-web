import { NextPage } from "next";
import { observer } from "mobx-react";
import { useStores } from "@/stores/context";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { UserSearchOverview } from "@/models/user/UserSearchOverview";
import { friendStatus } from "@/constants/FriendStatus";
import { FriendRequestUser } from "@/models/friend/FriendRequestUser";
import { DEFAULT_THUMBNAIL_URL } from "@/constants/default";

const SimilarNamedUser: NextPage<{ item: UserSearchOverview }> = observer(
  ({ item }) => {
    const [statusImage, setStatusImage] = useState<string>(
      "https://uxwing.com/wp-content/themes/uxwing/download/user-interface/add-plus-icon.png"
    );
    const { friendStore } = useStores();
    const { name, id, requestHistory } = item;

    useEffect(() => {
      if (requestHistory === friendStatus.ACCEPTED) {
        setStatusImage(
          "https://uxwing.com/wp-content/themes/uxwing/download/checkmark-cross/blue-check-mark-icon.png"
        );
      } else if (requestHistory === friendStatus.REQUESTED) {
        setStatusImage(
          "https://uxwing.com/wp-content/themes/uxwing/download/festival-culture-religion/cracker-color-icon.png"
        );
      } else {
        setStatusImage(
          "https://uxwing.com/wp-content/themes/uxwing/download/user-interface/add-plus-icon.png"
        );
      }
    }, [requestHistory]);
    return (
      <>
        <h3 style={{ display: "inline" }}>{name}</h3>{" "}
        <i>#{id.substring(0, 5)}&nbsp;</i>
        <Image
          src={statusImage}
          width={18}
          height={18}
          alt="select"
          onClick={async () => {
            switch (requestHistory) {
              case "ACCEPTED":
                break;
              case "NONE":
                await friendStore.sendFriendRequest(id);
                break;
              case "REQUESTED":
                if (confirm("친구 요청을 취소하시겠어요?") === true) {
                  await friendStore.cancelFriendRequest(id);
                  console.log(`친구 요청을 취소했습니다.`);
                }
                break;
            }
          }}
        />
        <br />
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

const FriendRequest: NextPage<{ item: FriendRequestUser }> = observer(
  ({ item }) => {
    const { requesterName, profileImage } = item;
    return (
      <td>
        <Image
          width={50}
          height={50}
          src={profileImage ? profileImage : DEFAULT_THUMBNAIL_URL}
          alt={`${requesterName}-profileImg`}
        />
        <h3>{requesterName}</h3>
        <Image
          width={18}
          height={18}
          src="https://uxwing.com/wp-content/themes/uxwing/download/checkmark-cross/accept-icon.png"
          alt="approve"
        />
        <Image
          width={18}
          height={18}
          src="https://uxwing.com/wp-content/themes/uxwing/download/checkmark-cross/cancel-icon.png"
          alt="refuse"
        />
      </td>
    );
  }
);

const FriendRequestGroup: NextPage<{ items: FriendRequestUser[] }> = observer(
  ({ items }) => {
    return (
      <>
        <table style={{ border: "1px black solid" }}>
          {items.map((item, key) => (
            <tr key={key}>
              <FriendRequest item={item} />
            </tr>
          ))}
        </table>
      </>
    );
  }
);

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
      <button
        onClick={(e) => {
          friendStore.fetchFriendRequests();
        }}
      >
        친구 요청 조회
      </button>
      <br />

      {friendStore.successMessage ? (
        <h3>{friendStore.successMessage}</h3>
      ) : null}
      {friendStore.errorMessage ? <h3>{friendStore.errorMessage}</h3> : null}
      <SimilarNamedUserGroup items={friendStore.userSearchOverviews} />
      {friendStore.friendRequestUsers && (
        <FriendRequestGroup items={friendStore.friendRequestUsers} />
      )}
    </>
  );
});
export default friends;
