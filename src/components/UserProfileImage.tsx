import { NextPage } from "next";
import Image from "next/image";
import headerStyles from "@/styles/header.module.scss";

export const UserProfileImage: NextPage<{
  profileSrc: string;
  width?: number;
  height?: number;
}> = ({ profileSrc, width = 40, height = 40 }) => {
  return (
    <Image
      width={width}
      height={height}
      src={profileSrc}
      alt="User profile image"
      className={`${headerStyles["user-profile-image"]}`}
    />
  );
};
