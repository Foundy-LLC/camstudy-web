import React, { useState } from "react";
import { NextPage } from "next";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { observer } from "mobx-react";
import { UserStore } from "@/stores/UserStore";
import { auth } from "@/service/firebase";

const Login: NextPage = () => {
  const [userStore] = useState(new UserStore());
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  if (loading) {
    return <div>Loading</div>;
  }
  if (user && userStore.isNewUser !== undefined) {
    console.log(userStore.isNewUser);
    if (userStore.isNewUser) {
      router.push("/welcome").then(() => {});
    } else {
      router.push("/").then(() => {});
    }
    return <div>Loading</div>;
  }

  return (
    <div>
      <button onClick={() => userStore.signInWithGoogle()}>
        Google Sign In
      </button>
      <button onClick={() => userStore.signInWithGithub()}>
        Github Sign In
      </button>
      <div>{userStore.errorMessage}</div>
    </div>
  );
};

export default observer(Login);
