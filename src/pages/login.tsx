import React from "react";
import { NextPage } from "next";
import { observer } from "mobx-react";
import userStore from "@/stores/UserStore";
import { useRouter } from "next/router";
import { useAuth } from "@/components/AuthProvider";

const Login: NextPage = () => {
  const router = useRouter();
  const auth = useAuth();

  if (auth.user && userStore.isNewUser !== undefined) {
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
    </div>
  );
};

export default observer(Login);
