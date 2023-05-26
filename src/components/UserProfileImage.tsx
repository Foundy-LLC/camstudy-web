import { NextPage } from "next";
import Image from "next/image";
import headerStyles from "@/styles/header.module.scss";
import { IMAGE_SERVER_URL } from "@/constants/image.constant";
import React, { useState } from "react";

const userProfileImageLoader = (userId: string): string => {
  return `${IMAGE_SERVER_URL}/users/${userId}.png`;
};

export const UserProfileImage: NextPage<{
  userId: string;
  width?: number;
  height?: number;
}> = ({ userId, width = 40, height = 40 }) => {
  const [error, setError] = useState<boolean>(false);
  const src = userProfileImageLoader(userId);
  if (error) {
    return (
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
  }
  return (
    <Image
      width={width}
      height={height}
      src={src}
      onError={() => setError(true)}
      alt="User profile image"
      className={`${headerStyles["user-profile-image"]}`}
    />
  );
};
