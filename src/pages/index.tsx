import Image from "next/image";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import {
  IMAGE_SERVER_URL,
  USER_DEFAULT_IMAGE_SRC,
} from "@/constants/image.constant";
import userStore from "@/stores/UserStore";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { verifyUserToken } from "@/service/verifyUserToken";
import { CropsType } from "@/models/crop/CropsType";

// TODO 페이지 들어갈 때 유저 쿠키가 유효한지 판단함. 중복되는 코드라서 따로 빼보는 방법 찾아 볼 것.
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return await verifyUserToken(ctx);
};

function Home(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [src, setSrc] = useState(props.uid);
  const [errorMessage, setErrorMessage] = useState("");
  // TODO(민성): UserProfileImage와 중복되는 코드 제거하기.
  const userProfileImageLoader = ({ src }: { src: string }): string => {
    return `${IMAGE_SERVER_URL}/users/${src}.png`;
  };
  const loggingUserInformation = () => {
    console.log(JSON.stringify(userStore.currentUser));
  };

  // 테스트용
  const setCrop = async () => {
    const data = {
      userId: "ZwI7O4fBI1fvJfOANmq8vij6Pjm2",
      cropType: CropsType.STRAWBERRY,
    };
    await fetch("/api/crops/strawberry", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
  };

  useEffect(() => {
    setErrorMessage(
      userStore.errorMessage == undefined ? "" : userStore.errorMessage
    );
  }, []);

  return (
    <div>
      {/* TODO(민성): UserProfileImage와 중복되는 코드 제거하기. */}
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
      <button onClick={() => loggingUserInformation()}>
        getUserInformation
      </button>
      <button onClick={() => router.push(`/users/${props.uid}`)}>
        내 프로필
      </button>
      <button onClick={() => setCrop()}>작물</button>
      <button
        onClick={() =>
          userStore.signOut().then(() => {
            router.push("/login");
          })
        }
      >
        sign out
      </button>
      <div>{errorMessage}</div>
    </div>
  );
}

export default observer(Home);
