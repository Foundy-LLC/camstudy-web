import { NextPage } from "next";
import React, { useEffect } from "react";
import { useStores } from "@/stores/context";
import { observer } from "mobx-react-lite";
import { RoomOverview } from "@/models/room/RoomOverview";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/service/firebase";
import Router, { useRouter } from "next/router";
import roomListStyles from "@/styles/room-list.module.scss";
import { DEFAULT_THUMBNAIL_URL } from "@/constants/default";
import lockedIcon from "/public/room/locked.png";
import optionIcon from "/public/room/option.png";
import roomListIcon from "/public/room/roomListIcon.png";
import { UserOverview } from "@/models/user/UserOverview";
import InfiniteScroll from "react-infinite-scroll-component";
import { Layout } from "@/components/Layout";

const RoomItemGroup: NextPage<{ items: RoomOverview[] }> = observer(
  ({ items }) => {
    const { roomListStore } = useStores();
    return (
      <>
        <div
          id="room-list-frame"
          className={`${roomListStyles["room-list-frame"]} elevation__card__search-bar__contained-button--waiting__etc`}
        >
          <div className={`${roomListStyles["room-list-info"]}`}>
            <Image
              src={roomListIcon}
              alt={"room-list-icon"}
              width={20}
              height={20}
              className={`${roomListStyles["room-list-icon"]}`}
            />
            <p
              className={`${roomListStyles["room-list-title"]} typography__text--big`}
            >
              현재 활성화 룸 목록
            </p>
          </div>

          <div id="room-scroll" className={`${roomListStyles["room-scroll"]} `}>
            <InfiniteScroll
              dataLength={items.length}
              next={() =>
                setTimeout(() => {
                  roomListStore.fetchRooms();
                }, 800)
              }
              hasMore={roomListStore.isExistNextPage}
              loader={
                <p
                  className={`${roomListStyles["room-scroll-text"]} typography__text--big`}
                >
                  <b>스터디 룸 목록 불러오는 중...</b>
                </p>
              }
              endMessage={
                <p
                  className={`${roomListStyles["room-scroll-text"]} typography__text--big`}
                >
                  <b>더 이상 방이 없습니다.</b>
                </p>
              }
              scrollableTarget="room-scroll"
            >
              <div className={`${roomListStyles["room-list-grid"]}`}>
                {items.map((item) => (
                  <RoomItem roomOverview={item} key={item.id} />
                ))}
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </>
    );
  }
);

const RoomItem: NextPage<{ roomOverview: RoomOverview }> = observer(
  ({ roomOverview }) => {
    return (
      <div
        className={`${roomListStyles["room-list-form"]} elevation__card__search-bar__contained-button--waiting__etc`}
      >
        <Image
          src={
            roomOverview.thumbnail
              ? roomOverview.thumbnail
              : DEFAULT_THUMBNAIL_URL
          }
          alt={`${roomOverview.title}-thumbnail-img`}
          className={`${roomListStyles["room-thumbnail-img"]}`}
          width={96}
          height={96}
        ></Image>
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <div style={{ display: "inline-flex" }}>
            <p
              className={`${roomListStyles["room-title"]} typography__text--big`}
            >
              {roomOverview.title}
            </p>
            {!roomOverview.hasPassword ? null : (
              <Image
                src={lockedIcon}
                width={15}
                height={20}
                alt="locked"
                style={{ marginTop: "19px" }}
              />
            )}
            <Image
              src={optionIcon}
              alt={"option_icon"}
              width={16}
              height={4}
              style={{
                marginLeft: "auto",
                marginTop: "26px",
                marginRight: "20px",
              }}
            />
          </div>
          <div style={{ display: "inline-flex" }}>
            {roomOverview.tags && <RoomTagGroup userTags={roomOverview.tags} />}
          </div>
          <div style={{ display: "inline-flex" }}>
            <div>
              <JoinedUserProfiles
                joinedUsers={roomOverview.joinedUsers}
                maxCount={roomOverview.maxCount}
              />
            </div>
            <button
              className={`${roomListStyles["room-enter-button"]} typography__text`}
              style={{
                marginLeft: "auto",
                marginRight: "16px",
                marginBottom: "16px",
              }}
              onClick={() => {
                const roomLink = `/rooms/${roomOverview.id}`;
                Router.push(roomLink);
              }}
            >
              <p>입장하기</p>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

const RoomTagGroup: NextPage<{ userTags: string[] }> = observer(
  ({ userTags }) => {
    return (
      <div className={`${roomListStyles["room-tags"]} typography__text`}>
        {userTags.map((userTag, key) => (
          <RoomTag userTag={userTag} key={key} />
        ))}
      </div>
    );
  }
);

const RoomTag: NextPage<{ userTag: string }> = observer(({ userTag }) => {
  return <a>{userTag.toString() + " "}</a>;
});

const JoinedUserProfiles: NextPage<{
  joinedUsers: UserOverview[];
  maxCount: number;
}> = observer(({ joinedUsers, maxCount }) => {
  //TODO (건우): 최대 인원에 맞춰 slice 처리 수정 필요
  const users = joinedUsers.slice(0, maxCount).map((user) => user.profileImage);
  const blank = maxCount - users.length;
  for (var i = 0; i < blank; i++) {
    users.push("*blank#");
  }
  return (
    <>
      {users.map((user) => {
        return user === "*blank#" ? (
          <button
            className={`${roomListStyles["room-joiner-img-blank"]}`}
          ></button>
        ) : (
          <Image
            className={`${roomListStyles["room-joiner-img"]}`}
            alt={`user-profile-img`}
            src={user ? user : DEFAULT_THUMBNAIL_URL}
            width={32}
            height={32}
          ></Image>
        );
      })}
    </>
  );
});
//TODO(건우): 최근 방 조회 ui 만들 때 참고용, 주석 삭제 필요
const RoomList: NextPage = observer(() => {
  const router = useRouter();
  const { roomListStore, userStore } = useStores();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      roomListStore.setMasterId(user.uid);
      roomListStore.fetchRooms();
    }
  }, [user]);

  if (loading) {
    return <div>Loading</div>;
  }
  if (!user) {
    router.replace("/login");
    return <div>Please sign in to continue</div>;
  }
  return (
    <Layout>
      <RoomItemGroup items={roomListStore.roomOverviews} />
      {roomListStore.errorMessage === undefined ? null : (
        <h3>{roomListStore.errorMessage}</h3>
      )}
    </Layout>
  );
});
export default RoomList;
