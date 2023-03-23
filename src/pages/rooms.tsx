import { NextPage } from "next";
import React, { useEffect } from "react";
import { useStores } from "@/stores/context";
import { observer } from "mobx-react-lite";
import { RoomOverview } from "@/models/room/RoomOverview";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/service/firebase";
import { useRouter } from "next/router";
import userStore from "@/stores/UserStore";
import roomListStyles from "@/styles/room-list.module.scss";
import { DEFAULT_THUMBNAIL_URL } from "@/constants/default";
import locked_icon from "/public/room/locked.png";
import option_icon from "/public/room/option.png";
import enter_btn from "/public/room/enterBtn.png";
const RoomTag: NextPage<{ userTag: string }> = observer(({ userTag }) => {
  return <a>{userTag.toString() + " "}</a>;
});

const RoomTagGroup: NextPage<{ userTags: string[] }> = observer(
  ({ userTags }) => {
    return (
      <div className={`${roomListStyles["room-tags"]} typography__text`}>
        {userTags.map((userTag) => (
          <RoomTag userTag={userTag} />
        ))}
      </div>
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
            <h3
              className={`${roomListStyles["room-title"]} typography__text--big`}
            >
              {roomOverview.title}
            </h3>
            {!roomOverview.hasPassword ? null : (
              <Image
                src={locked_icon}
                width={15}
                height={20}
                alt="locked"
                style={{ marginTop: "19px" }}
              />
            )}
            <Image
              src={option_icon}
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
          <div style={{ display: "inline-flex", justifyContent: "flex-start" }}>
            <div style={{ display: "inline-flex" }}>
              {<p className={`${roomListStyles["room-joiner-img-blank"]}`}></p>}
            </div>
            <Image
              className={`${roomListStyles["room-enter-button"]}`}
              style={{
                marginLeft: "auto",
                marginTop: "10px",
                marginRight: "16px",
                marginBottom: "16px",
              }}
              src={enter_btn}
              alt={"enterBtn"}
            />
          </div>
        </div>

        {/*<p>*/}
        {/*  :{roomOverview.joinCount}/{roomOverview.maxCount}*/}
        {/*</p>*/}
      </div>
    );
  }
);

const RoomItemGroup: NextPage<{ items: RoomOverview[] }> = observer(
  ({ items }) => {
    return (
      <div
        className={`${roomListStyles["room-list-frame"]} elevation__card__search-bar__contained-button--waiting__etc`}
      >
        <>
          {items.map((item) => (
            <RoomItem roomOverview={item} key={item.id} />
          ))}
        </>
      </div>
    );
  }
);

const SelectedThumbnailImage: NextPage<{ imageUrl: string }> = observer(
  ({ imageUrl }) => {
    if (imageUrl === "") return <></>;
    console.log(imageUrl);
    return (
      <Image src={imageUrl} alt="방 썸네일 사진" width={100} height={100} />
    );
  }
);

const RoomList: NextPage = observer(() => {
  const router = useRouter();
  const { roomListStore } = useStores();
  const [user, loading] = useAuthState(auth);

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
    <>
      <div>
        <button
          id="sign-out"
          style={{
            float: "right",
            marginRight: "30px",
            width: "100px",
            height: "30px",
          }}
          onClick={() => userStore.signOut()}
        >
          sign out
        </button>
      </div>
      <div>
        <h1>rooms page</h1>

        <input
          id="pageNum"
          placeholder="페이지 번호"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            console.log(e.target.value);
            roomListStore.changeRoomNum(e.target.value);
          }}
        ></input>
        <button
          id="getBtn"
          onClick={async () => {
            await roomListStore.fetchRooms();
          }}
        >
          GET
        </button>
        <button
          id="recentRoomBtn"
          onClick={async () => {
            await roomListStore.fetchRecentRooms(user.uid);
          }}
        >
          최근 방 조회
        </button>
        <br />
        <input
          id="roomName"
          placeholder="방 제목"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            roomListStore.setRoomTitleInput(e.target.value);
          }}
        ></input>
        <button
          id="PostBtn"
          onClick={async () => {
            await roomListStore.createRoom();
          }}
        >
          POST
        </button>
        <br />
        <input
          id="roomThumbnail"
          type="file"
          accept="image/png, image/jpeg"
          onChange={(e) => {
            if (e.target.files) {
              roomListStore.importRoomThumbnail(e.target.files[0]);
            }
          }}
        ></input>
        <SelectedThumbnailImage imageUrl={roomListStore.imageUrl} />
        <RoomItemGroup items={roomListStore.roomOverviews} />
        <div>
          <br />
          <h3>생성한 방:</h3>
          <p>{roomListStore.createdTitle}</p>
        </div>

        {roomListStore.errorMessage === undefined ? null : (
          <h3>{roomListStore.errorMessage}</h3>
        )}
        {/*{RoomsInfo && <p id="getResponse">{RoomsInfo}</p>}*/}
      </div>
    </>
  );
});
export default RoomList;
