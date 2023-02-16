import React, { useEffect, useState } from "react";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { WelcomeStore } from "@/stores/WelcomeStore";
import { observer } from "mobx-react";
import userStore from "@/stores/UserStore";
import { useAuth } from "@/components/AuthProvider";
import nookies from "nookies";
import { firebaseAdmin } from "@/service/firebaseAdmin";

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

const Welcome: NextPage = () => {
  const { user } = useAuth();
  const [welcomeStore] = useState(new WelcomeStore());
  const successToCreate = welcomeStore.successToCreate;
  const router = useRouter();
  /**
   * Welcome 페이지에서는 이동 못하도록 설정
   */
  useEffect(() => {
    router.events.on("routeChangeStart", () => {
      router.events.emit("routeChangeError");
    });
  }, [router.events]);

  useEffect(() => {
    if (successToCreate) {
      router.replace("/");
    }
  }, [successToCreate, router]);

  const inputOnChange = (e: any) => {
    if (e.target.files[0]) {
      const imageFile = e.target.files[0];
      console.log(imageFile);
      welcomeStore.changeProfileImage(imageFile);
    }
  };

  return (
    <div>
      <input
        id={"profileImage"}
        type={"file"}
        accept={"image/png, image/jpeg, image/jpg"}
        onChange={(e) => inputOnChange(e)}
      ></input>
      <div>{welcomeStore.profileImageUrlErrorMessage}</div>
      <br />
      <input
        id={"name"}
        type={"text"}
        onChange={(e) => welcomeStore.changeName(e.target.value)}
        value={welcomeStore.name}
      />
      <div>{welcomeStore.nameErrorMessage}</div>
      <br />
      <input
        id={"introduce"}
        type={"text"}
        onChange={(e) => welcomeStore.changeIntroduce(e.target.value)}
        value={welcomeStore.introduce}
      />
      <div>{welcomeStore.introduceErrorMessage}</div>
      <br />
      <input
        id={"tags"}
        type={"text"}
        onChange={(e) => welcomeStore.changeTags(e.target.value)}
        value={welcomeStore.tags}
      />
      <div>{welcomeStore.tagsErrorMessage}</div>
      <br />
      <button onClick={() => welcomeStore.createUser(user!.uid)}>확인</button>
      <br />

      <button
        onClick={() =>
          userStore.signOut().then(() => {
            router.push("/login");
          })
        }
      >
        Sign out
      </button>

      <div>{welcomeStore.errorMessage}</div>
    </div>
  );
};
export default observer(Welcome);
