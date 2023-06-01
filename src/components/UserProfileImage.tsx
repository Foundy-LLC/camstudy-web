import { NextPage } from "next";
import Image from "next/image";
import headerStyles from "@/styles/header.module.scss";
import { IMAGE_SERVER_URL } from "@/constants/image.constant";
import React, { useEffect, useMemo, useState } from "react";
import { useStores } from "@/stores/context";
import { observer } from "mobx-react";

const userProfileImageLoader = (userId: string): string => {
  return `${IMAGE_SERVER_URL}/users/${userId}.png`;
};

export const UserProfileImage: NextPage<{
  userId: string;
  width?: number;
  height?: number;
}> = observer(({ userId, width = 40, height = 40 }) => {
  const { profileStore } = useStores();

  useEffect(() => {
    console.log(123);
    profileStore.getUserProfile(userId);
    console.log(profileStore.imageUrl);
  }, [profileStore.imageUrl]);

  return profileStore.userOverview && profileStore.userOverview.profileImage ? (
    <Image
      width={width}
      height={height}
      src={profileStore.userOverview.profileImage}
      alt="User profile image"
      className={`${headerStyles["user-profile-image"]}`}
    />
  ) : (
    <>
      <div className={`${headerStyles["user-profile-image"]}`}>
        <span className="material-symbols-sharp">person</span>
      </div>
      <style jsx>
        {`
          .material-symbols-sharp {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
          }
        `}
      </style>
    </>
  );
});
