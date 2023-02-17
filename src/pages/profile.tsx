import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { verifyUserToken } from "@/service/verifyUserToken";
import { observer } from "mobx-react";
import useSWR from "swr";
import { User } from "@/models/user/User";
import Image from "next/image";
import {
  IMAGE_SERVER_URL,
  USER_DEFAULT_IMAGE_SRC,
} from "@/constants/image.constant";
import React, { useState } from "react";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return await verifyUserToken(ctx);
};

function Profile(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const [src, setSrc] = useState(props.uid);
  const userProfileImageLoader = ({ src }: { src: string }): string => {
    return `${IMAGE_SERVER_URL}/users/${src}.png`;
  };
  const fetcher = (args: string) => fetch(args).then((res) => res.json());
  const { data, error, isLoading } = useSWR(`/api/users/${props.uid}`, fetcher);
  const userInfo = data as { message: string; data: User };

  if (error) return "error";
  if (isLoading) return "Loading";

  console.log(userInfo);
  return (
    <div>
      <Image
        width={150}
        height={150}
        loader={userProfileImageLoader}
        src={src}
        alt={"user profile image"}
        onError={(e) => {
          e.currentTarget.onerror = null;
          setSrc(USER_DEFAULT_IMAGE_SRC);
        }}
      ></Image>
      <h1>아이디: {userInfo.data.id}</h1>
      <h1>이름: {userInfo.data.name}</h1>
      <h1>태그: {userInfo.data.tags}</h1>
      <h1>소개: {userInfo.data.introduce}</h1>
      <h1>총 공부 시간(분): {userInfo.data.totalStudyMinute}</h1>
      <h1>소속: {userInfo.data.organizations}</h1>
      <h1>랭킹: {userInfo.data.rankingScore}</h1>
    </div>
  );
}
export default Profile;
