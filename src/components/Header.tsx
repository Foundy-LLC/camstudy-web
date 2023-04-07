import React, { useEffect } from "react";
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
      <Image
        className={`${headerStyles["header-image"]}`}
        src={logo}
        alt={"brand_logo"}
        priority={true}
      ></Image>
      <RecentRoomList userId={userId}></RecentRoomList>
      <div className={`${headerStyles["header-user-section"]}`}>
        <UserProfile userId={userId}></UserProfile>
        <div className={`${headerStyles["button-group"]}`}>
          {exButtonList.map((button) => {
            return (
              <button
                key={button.icon}
                onClick={() => buttonClickEvent(button.path)}
              >
                <span className="material-symbols-outlined">{button.icon}</span>
              </button>
            );
          })}
        </div>
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

  return (
    <div className={`${headerStyles["recent-room-list"]}`}>
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
          ></Image>
        );
      })}
      <button className={`${headerStyles["create-room-button"]}`}>
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
      <div className={"image"}>
        <UserProfileImage
          userId={userId}
          width={44}
          height={44}
        ></UserProfileImage>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label className={"user-profile-name typography__text"}>
          {userStore.currentUser?.name}
        </label>
        <label className={"typography__text--small"}>
          {userStore.currentUser?.introduce}
        </label>
      </div>
      <style jsx>
        {`
          .user-profile-box {
            display: flex;
            min-width: 14.75rem;
          }

          .user-profile-name {
            font-weight: 500;
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
