import { NextPage } from "next";
import { observer } from "mobx-react";
import { useStores } from "@/stores/context";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { UserSearchOverview } from "@/models/user/UserSearchOverview";
import { friendStatus } from "@/constants/FriendStatus";
import { FriendRequestUser } from "@/models/friend/FriendRequestUser";
import { DEFAULT_THUMBNAIL_URL } from "@/constants/default";
import {
  APPROVE_FRIEND_REQUEST_SUCCESS,
  FRIEND_REQUEST_REFUSE_SUCCESS,
  REFUSE_FRIEND_REQUEST_SUCCESS,
} from "@/constants/FriendMessage";

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
                if (confirm("?????? ????????? ??????????????????????") === true) {
                  await friendStore.cancelFriendRequest(id);
                  console.log(`?????? ????????? ??????????????????.`);
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
    const { requesterName, requesterId, profileImage } = item;
    const { friendStore } = useStores();
    return (
      <>
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
          alt="accept"
          onClick={async () => {
            if (confirm("?????? ????????? ??????????????????????") === true) {
              await friendStore.acceptFriendRequest(requesterId);
              console.log(APPROVE_FRIEND_REQUEST_SUCCESS);
            }
          }}
        />
        <Image
          width={18}
          height={18}
          src="https://uxwing.com/wp-content/themes/uxwing/download/checkmark-cross/cancel-icon.png"
          alt="reject"
          onClick={async () => {
            if (confirm("?????? ????????? ??????????????????????") === true) {
              await friendStore.refuseFriendRequest(requesterId);
              console.log(FRIEND_REQUEST_REFUSE_SUCCESS);
            }
          }}
        />
      </>
    );
  }
);

const FriendRequestGroup: NextPage<{ items: FriendRequestUser[] }> = observer(
  ({ items }) => {
    return (
      <>
        {items.map((item, key) => (
          <FriendRequest item={item} key={key} />
        ))}
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
        placeholder="?????? ?????????"
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
        ?????? ??????
      </button>
      <button
        onClick={(e) => {
          friendStore.fetchFriendRequests();
        }}
      >
        ?????? ?????? ??????
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
