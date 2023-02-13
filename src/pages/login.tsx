import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { observer } from "mobx-react";
import { auth } from "@/service/firebase";
import userStore from "@/stores/UserStore";

const Login: NextPage = () => {
  const [user, loading] = useAuthState(auth);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    setErrorMessage(
      userStore.errorMessage == undefined ? "" : userStore.errorMessage
    );
  }, []);

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
      <div>{errorMessage}</div>
    </div>
  );
};

export default observer(Login);
