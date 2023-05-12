import { NextPage } from "next";
import { observer } from "mobx-react";
import { Layout } from "@/components/Layout";
import React, { useEffect, useState } from "react";
import userStyles from "@/styles/searchUser.module.scss";
import { useStores } from "@/stores/context";
import Image from "next/image";
import optionIcon from "/public/room/option.png";
import { PagenationBar } from "@/components/PagenationBar";
import { DEFAULT_THUMBNAIL_URL } from "@/constants/default";
import { UserStatus } from "@/models/user/UserStatus";
import { UserSearchOverview } from "@/models/user/UserSearchOverview";
import { useDebounce } from "@/components/UseDebounce";
import { FRIEND_STATUS, friendStatus } from "@/constants/FriendStatus";
import { NoneButton } from "@/components/friendRequestButton/NoneButton";
import { RequestedButton } from "@/components/friendRequestButton/RequestedButton";
import { AcceptedButton } from "@/components/friendRequestButton/AcceptedButton";

const FriendOverview: NextPage<{ item: UserSearchOverview }> = observer(
  ({ item }) => {
    const { friendStore } = useStores();
    const { id, name, profileImage, requestHistory, introduce, status } = item;
    console.log(name, requestHistory);
    return (
      <>
        <div
          className={`${userStyles["search-user-form"]} elevation__card__search-bar__contained-button--waiting__etc`}
        >
          <Image
            width={50}
            height={50}
            src={profileImage ? profileImage : DEFAULT_THUMBNAIL_URL}
            alt={`${name}-profileImg`}
            className={`${userStyles["user-profile"]} `}
          />
          <div className={`${userStyles["user-info"]} typography__text`}>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <label className={`${userStyles["user-name"]} typography__text`}>
                {name}
              </label>{" "}
              {status === UserStatus.LOGIN ? (
                <label
                  className={`${userStyles["user-status-online"]} typography__caption`}
                >
                  접속 중
                </label>
              ) : (
                <label
                  className={`${userStyles["user-status-offline"]} typography__caption`}
                >
                  로그오프
                </label>
              )}{" "}
            </div>
            <label
              className={`typography__text`}
              style={{
                color: "#838383",
                fontFamily: "Pretendard",
                fontWeight: "400",
              }}
            >
              {introduce}
            </label>
          </div>
          <div className={`${userStyles["user-button"]}`}>
            {requestHistory === friendStatus.NONE ? (
              <NoneButton name={name} userId={id} />
            ) : requestHistory === friendStatus.REQUESTED ? (
              <RequestedButton name={name} userId={id} />
            ) : (
              <AcceptedButton name={name} userId={id} />
            )}
            <button
              className={`${userStyles["user-option__button"]}`}
              onClick={async () => {
                if (
                  confirm(`${name}을 친구 목록에서 삭제하시겠어요?`) === true
                ) {
                  await friendStore.deleteFriend(id);
                }
              }}
            >
              <span className="material-symbols-sharp">more_horiz</span>
            </button>
          </div>
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
  }
);

const UserOverviewGroup: NextPage<{ items: UserSearchOverview[] }> = observer(
  ({ items }) => {
    const { friendStore } = useStores();
    return (
      <>
        <div
          className={`${userStyles["search-user-frame"]} elevation__card__search-bar__contained-button--waiting__etc`}
        >
          <div className={`${userStyles["search-user-info"]}`}>
            <span
              className={`${userStyles["search-user-icon"]} material-symbols-sharp`}
            >
              search
            </span>
            <label
              className={`${userStyles["search-user-label"]} typography__text--big`}
            >
              검색 결과
            </label>
          </div>
          {!friendStore.searchErrorMessage ? (
            <>
              <div className={`${userStyles["search-user-grid"]}`}>
                {items.map((item, key) => (
                  <FriendOverview item={item} key={key} />
                ))}
              </div>
              {/*<div*/}
              {/*  style={{*/}
              {/*    position: "absolute",*/}
              {/*    bottom: 46,*/}
              {/*    left: "50%",*/}
              {/*    transform: "translate(-50%, -50%)",*/}
              {/*  }}*/}
              {/*>*/}
              {/*  <PagenationBar*/}
              {/*    maxPage={friendStore.friendListMaxPage}*/}
              {/*    update={friendStore.fetchFriendList}*/}
              {/*  />*/}
              {/*</div>*/}
            </>
          ) : (
            <div
              className={`${userStyles["search-user-error"]} typography__text`}
            >
              <p>{friendStore.searchErrorMessage}</p>
            </div>
          )}
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
  }
);

const Users: NextPage = observer(() => {
  const { friendStore } = useStores();
  const [searchInput, setSearchInput] = useState("");
  const debounceSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    if (debounceSearch) {
      friendStore.changeSearchUserInput(searchInput);
      friendStore.findUserByName();
    }
  }, [debounceSearch]);
  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <p
            className={`${userStyles["search-user__title"]} typography__sub-headline`}
          >
            유저 검색
          </p>
          <input
            type="text"
            placeholder="유저 닉네임 혹은 이메일을 검색해주세요"
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            className={`${userStyles["search-user__input"]} typography__text--small`}
          ></input>
        </div>

        <UserOverviewGroup items={friendStore.userSearchOverviews} />
      </div>
    </Layout>
  );
});
export default Users;
