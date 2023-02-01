import React from "react";
import { NextPage } from "next";
import { initFirebase } from "@/service/firebase";
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "@firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { auth } from "src/service/firebase";

const Login: NextPage = () => {
  initFirebase();
  const googleAuthProvider = new GoogleAuthProvider();
  const githubAuthProvider = new GithubAuthProvider();
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  if (loading) {
    return <div>Loading</div>;
  }
  if (user) {
    router.push({ pathname: "/welcome" }); //, query: {uid: user.uid}
    return <div>Loading</div>;
  }

  const GoogleSignIn = async () => {
    const result = await signInWithPopup(auth, googleAuthProvider);
  };
  const GithubSignIn = async () => {
    const result = await signInWithPopup(auth, githubAuthProvider);
  };

  return (
    <div>
      <button onClick={GoogleSignIn}>Google Sign In</button>
      <button onClick={GithubSignIn}>Github Sign In</button>
    </div>
  );
};

export default Login;
