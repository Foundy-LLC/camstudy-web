import Image from "next/image";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import {
  IMAGE_SERVER_URL,
  USER_DEFAULT_IMAGE_SRC,
} from "@/constants/image.constant";
import userStore from "@/stores/UserStore";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { firebaseAdmin } from "@/service/firebaseAdmin";
import nookies from "nookies";
import { useRouter } from "next/router";
import userService from "@/service/user.service";

// TODO 페이지 들어갈 때 유저 쿠키가 유효한지 판단함. 중복되는 코드라서 따로 빼보는 방법 찾아 볼 것.
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const cookies = nookies.get(ctx);
    const token = await firebaseAdmin.auth().verifyIdToken(cookies.token);
    const { uid, email } = token;

    return {
      props: {
        message: `Your email is ${email} and your UID is ${uid}.`,
        uid: uid,
      },
    };
  } catch (err) {
    // either the `token` cookie didn't exist
    // or token verification failed
    // either way: redirect to the login page
    ctx.res.writeHead(302, { Location: "/login" });
    ctx.res.end();

    // `as never` prevents inference issues
    // with InferGetServerSidePropsType.
    // The props returned here don't matter because we've
    // already redirected the user.
    return { props: {} as never };
  }
};

function Home(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [src, setSrc] = useState(props.uid);
  const [errorMessage, setErrorMessage] = useState("");
  const userProfileImageLoader = ({ src }: { src: string }): string => {
    return `${IMAGE_SERVER_URL}/users/${src}.png`;
  };
  const loggingUserInformation = () => {
    console.log(JSON.stringify(userStore.currentUser));
  };

  useEffect(() => {
    setErrorMessage(
      userStore.errorMessage == undefined ? "" : userStore.errorMessage
    );
  }, []);

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
      <button onClick={() => loggingUserInformation()}>
        getUserInformation
      </button>
      <button
        onClick={() =>
          userStore.signOut().then(() => {
            router.push("/login");
          })
        }
      >
        sign out
      </button>
      <div>{props.message}</div>
      <div>{errorMessage}</div>
    </div>
  );
}

export default observer(Home);
