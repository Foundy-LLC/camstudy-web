import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useStores } from "@/stores/context";
import { observer } from "mobx-react-lite";
import { RoomOverview } from "@/models/room/RoomOverview";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/service/firebase";
import Router, { useRouter } from "next/router";
import roomListStyles from "@/styles/room-list.module.scss";
import { UserOverview } from "@/models/user/UserOverview";
import InfiniteScroll from "react-infinite-scroll-component";
import { Layout } from "@/components/Layout";
import { useDebounce } from "@/components/UseDebounce";

export const RoomItemGroup: NextPage<{ items: RoomOverview[] }> = observer(
  ({ items }) => {
    const { roomListStore } = useStores();
    return (
      <>
        <div
          id="room-list-frame"
          className={`${roomListStyles["room-list-frame"]} elevation__card__search-bar__contained-button--waiting__etc`}
        >
          <div className={`${roomListStyles["room-list-info"]}`}>
            <span
              className={`${roomListStyles["room-list-icon"]} material-symbols-sharp`}
            >
              chat_bubble
            </span>

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
                }, 1000)
              }
              hasMore={roomListStore.isExistNextPage}
              loader={
                <p
                  className={`${roomListStyles["room-scroll-text"]} typography__text--big`}
                >
                  <b>스터디 룸 목록 불러오는 중...</b>
                </p>
              }
              scrollableTarget="room-scroll"
            >
              <div className={`${roomListStyles["room-list-grid"]}`}>
                {items.map((item, key) => (
                  <RoomItem roomOverview={item} key={key} />
                ))}
              </div>
            </InfiniteScroll>
          </div>
        </div>
        <style jsx>{`
          .material-symbols-sharp {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
          }
        `}</style>
      </>
    );
  }
);

const RoomItem: NextPage<{ roomOverview: RoomOverview }> = observer(
  ({ roomOverview }) => {
    return (
      <>
        <div
          className={`${roomListStyles["room-list-form"]} elevation__card__search-bar__contained-button--waiting__etc`}
        >
          {roomOverview.thumbnail ? (
            <Image
              src={roomOverview.thumbnail}
              alt={`${roomOverview.title}-thumbnail-img`}
              className={`${roomListStyles["room-thumbnail-img"]}`}
              width={96}
              height={96}
            ></Image>
          ) : (
            <div
              className={`${roomListStyles["room-thumbnail-img"]} ${roomListStyles["drag-unable"]}`}
            >
              <div></div>
              <span className="material-symbols-sharp">help</span>
            </div>
          )}
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
                <span
                  className={`${roomListStyles["drag-unable"]} ${roomListStyles["room-list-icon"]} material-symbols-sharp`}
                  style={{
                    cursor: "default",
                    marginTop: "20px",
                    fontSize: "20px",
                  }}
                >
                  lock
                </span>
              )}
              <span
                className={`${roomListStyles["drag-unable"]} ${roomListStyles["room-list-icon"]} material-symbols-sharp`}
                style={{
                  marginLeft: "auto",
                  marginTop: "16px",
                  marginRight: "16px",
                  cursor: "pointer",
                }}
              >
                more_horiz
              </span>
            </div>
            <div style={{ display: "inline-flex" }}>
              {roomOverview.tags && (
                <RoomTagGroup userTags={roomOverview.tags} />
              )}
            </div>
            <div style={{ display: "inline-flex" }}>
              <div style={{ display: "flex" }}>
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
        <style jsx>
          {`
            .material-symbols-sharp {
              font-variation-settings: "FILL" 1, "wght" 700, "GRAD" 200,
                "opsz" 20;
            }
          `}
        </style>
      </>
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
  return <a>#{userTag.toString() + " "}</a>;
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
      {users.map((user, key) => {
        return user === "*blank#" ? (
          <button
            key={key}
            className={`${roomListStyles["room-joiner-img-blank"]}`}
          ></button>
        ) : user ? (
          <Image
            key={key}
            className={`${roomListStyles["room-joiner-img"]}`}
            alt={`user-profile-img`}
            src={user}
            width={32}
            height={32}
          ></Image>
        ) : (
          <div
            className={`${roomListStyles["room-joiner-img--default"]}`}
            key={key}
          >
            <span className="material-symbols-sharp">person</span>
          </div>
        );
      })}
      <style jsx>
        {`
          .material-symbols-sharp {
            font-variation-settings: "FILL" 1, "wght" 500, "GRAD" 200, "opsz" 48;
          }
        `}
      </style>
    </>
  );
});
//TODO(건우): 최근 방 조회 ui 만들 때 참고용, 주석 삭제 필요
const RoomList: NextPage = observer(() => {
  const router = useRouter();
  const { roomListStore, userStore } = useStores();
  const [user, loading] = useAuthState(auth);
  const [searchInput, setSearchInput] = useState("");
  const debounceSearch = useDebounce(searchInput, 500);
  useEffect(() => {
    console.log(debounceSearch);
    roomListStore.setSearchRoomNameInput(debounceSearch!);
    roomListStore.fetchRooms();
  }, [debounceSearch]);

  useEffect(() => {
    if (user) {
      roomListStore.setMasterId(user.uid);
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
      <div>
        <div className={`${roomListStyles["room-page__title"]}`}>
          <label
            className={`${roomListStyles["room-page__title__label"]} typography__sub-headline`}
          >
            스터디 룸 목록
          </label>
          <input
            className={`${roomListStyles["room-page__title__input"]} typography__text--small`}
            type={"text"}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            placeholder={"스터디 룸 제목 혹은 키워드를 검색해주세요"}
          />
        </div>
        <RoomItemGroup items={roomListStore.roomOverviews} />
        {roomListStore.errorMessage === undefined ? null : (
          <h3>{roomListStore.errorMessage}</h3>
        )}
      </div>
    </Layout>
  );
});
export default RoomList;
