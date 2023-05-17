import React, { useEffect, useState } from "react";
import Image from "next/image";
import logo from "../assets/brand_logo.svg";
import headerStyles from "@/styles/header.module.scss";
import { NextPage } from "next";
import { UserProfileImage } from "@/components/UserProfileImage";
import { useStores } from "@/stores/context";
import { observer } from "mobx-react";
import { DEFAULT_THUMBNAIL_URL } from "@/constants/default";
import Router from "next/router";
import { ThemeModeToggleButton } from "@/components/ThemeModeToggleButton";
import Link from "next/link";

export const Header: NextPage<{ userId: string }> = observer(({ userId }) => {
  const exButtonList = [
    { icon: "person", path: `/users/${userId}` },
    { icon: "share", path: "" },
    { icon: "more_horiz", path: "" },
  ];

  const buttonClickEvent = (path: string) => {
    Router.push(path);
  };

  return (
    <header className={"box-header"}>
      <Link href={"/"}>
        <Image
          className={`${headerStyles["header-image"]} ${headerStyles["dragUnable"]}`}
          src={logo}
          alt={"brand_logo"}
          priority={true}
        ></Image>
      </Link>
      <RecentRoomList userId={userId}></RecentRoomList>
      <div className={`${headerStyles["header-user-section"]}`}>
        <UserProfile userId={userId}></UserProfile>
        <div style={{ marginTop: "10px" }}>
          <ThemeModeToggleButton />
        </div>
      </div>
      <style jsx>
        {`
          .material-symbols-outlined {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
          }
        `}
      </style>
    </header>
  );
});

const RecentRoomList: NextPage<{ userId: string }> = observer(({ userId }) => {
  const [showDialog, setShowDialog] = useState<string>("");
  const { roomListStore } = useStores();
  useEffect(() => {
    roomListStore.fetchRecentRooms(userId);
  }, []);
  let recentRoomList = roomListStore.recentRoomOverviews;

  if (recentRoomList.length > 5) {
    recentRoomList = recentRoomList.slice(0, 5);
  }

  const joinRecentRoom = (roomId: string) => {
    Router.push(`rooms/${roomId}`);
  };

  const onMouseEnter = (
    e: React.MouseEvent<HTMLImageElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    const div = document.getElementById("roomTitleDialog");
    const position = (e.target as HTMLElement).getBoundingClientRect();
    div!.style.left = position.x.toString() + "px";
    div!.style.top = (position.y + 60).toString() + "px";
  };

  return (
    <div
      className={`${headerStyles["recent-room-list"]} ${headerStyles["dragUnable"]}`}
    >
      <div
        id="roomTitleDialog"
        className={`${headerStyles["recent-room-dialog"]} typography__text--small elevation__navigation-drawer__modal-side-bottom-sheet__etc`}
        hidden={showDialog === ""}
      >
        {showDialog}
      </div>
      {recentRoomList.map((room) => {
        return (
          <Image
            key={room.id}
            className={`${headerStyles["recent-room-item"]}`}
            alt={"room_thumbnail"}
            src={room.thumbnail || DEFAULT_THUMBNAIL_URL}
            width={44}
            height={44}
            onClick={() => joinRecentRoom(room.id)}
            onMouseEnter={(e) => {
              setShowDialog(room.title);
              onMouseEnter(e);
            }}
            onMouseLeave={() => {
              setShowDialog("");
            }}
          ></Image>
        );
      })}
      <button
        className={`${headerStyles["create-room-button"]}`}
        onMouseEnter={(e) => {
          setShowDialog("방 만들기");
          onMouseEnter(e);
        }}
        onMouseLeave={() => {
          setShowDialog("");
        }}
        onClick={() => {
          Router.push(`/enterRoom`);
        }}
      >
        <span className={`${headerStyles["icon"]} material-symbols-outlined`}>
          add
        </span>
      </button>
    </div>
  );
});

const UserProfile: NextPage<{ userId: string }> = observer(({ userId }) => {
  const { userStore } = useStores();

  return (
    <div className={"user-profile-box"}>
      <div className={`${headerStyles["dragUnable"]} image`}>
        {userStore.currentUser && (
          <UserProfileImage
            userId={userStore.currentUser?.id}
            width={44}
            height={44}
          ></UserProfileImage>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <label
          className={`${headerStyles["user-profile-name"]} typography__text`}
        >
          {userStore.currentUser?.name}
        </label>
        <label
          className={`${headerStyles["user-profile-introduce"]} typography__text--small`}
          style={{
            fontWeight: "300",
            width: "180px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {userStore.currentUser?.introduce}
        </label>
      </div>
      <style jsx>
        {`
          .material-symbols-sharp {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
          }
          .user-profile-box {
            display: flex;
            min-width: 14.75rem;
          }

          .image {
            width: 44px;
            height: 44px;
            padding-right: 0.75rem;
          }

          label {
            display: block;
          }
        `}
      </style>
    </div>
  );
});
