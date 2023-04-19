import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { verifyUserToken } from "@/service/verifyUserToken";
import useSWR from "swr";
import { User } from "@/models/user/User";
import React from "react";
import { ResponseBody } from "@/models/common/ResponseBody";
import { UserProfileImage } from "@/components/UserProfileImage";
import { NOT_FOUND_USER_MESSAGE } from "@/constants/message";
import { useRouter } from "next/router";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return await verifyUserToken(ctx);
};

function UserProfile(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();
  const userId = router.query.userId as string;
  const fetcher = (args: string) => fetch(args).then((res) => res.json());
  const { data, error, isLoading } = useSWR<ResponseBody<User>>(
    `/api/users/${userId}`,
    fetcher
  );
  const user = data?.data;

  if (error) return "error";
  if (data?.message === NOT_FOUND_USER_MESSAGE || user === undefined)
    return NOT_FOUND_USER_MESSAGE;
  if (isLoading) return "Loading";
  if (user != undefined)
    return (
      <div>
        <UserProfileImage userId={userId} width={150} height={150} />
        <h1>아이디: {user.id}</h1>
        <h1>이름: {user.name}</h1>
        <h1>태그: {user.tags}</h1>
        <h1>소개: {user.introduce}</h1>
        <h1>소속: {user.organizations}</h1>
      </div>
    );
}

export default UserProfile;
