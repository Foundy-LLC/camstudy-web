import { NextPage } from "next";
import { getUserProfileImageUrl } from "@/models/room/ChatMessage";
import { DEFAULT_PROFILE_IMAGE_URL } from "@/constants/user.constant";

export const UserProfileImage: NextPage<{
  userId: string;
  width?: number | string;
  height?: number | string;
}> = ({ userId, width = "40px", height = "40px" }) => {
  return (
    <img
      width={width}
      height={height}
      src={getUserProfileImageUrl(userId)}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL;
      }}
      alt="userProfileImage"
    />
  );
};
