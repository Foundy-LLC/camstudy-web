import React, { useContext } from "react";
import { NextPage } from "next";
import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { useAuth } from "@/components/AuthProvider";
import Image from "next/image";
import logo from "../assets/logo.png";
import github_logo from "../assets/github_logo.png";
import google_logo from "../assets/google_logo.png";
import {
  GITHUB_LOGIN_BUTTON_TEXT,
  GOOGLE_LOGIN_BUTTON_TEXT,
} from "@/constants/login.constant";
import loginStyles from "@/styles/login.module.scss";
import { ThemeContext } from "@/context/ThemeContext";
import { PROJECT_SUB_TITLE, PROJECT_TITLE } from "@/constants/common";
import { useStores } from "@/stores/context";

const Login: NextPage = () => {
  const { userStore } = useStores();
  const router = useRouter();
  const auth = useAuth();
  const { theme } = useContext(ThemeContext);

  if (auth.user && userStore.isNewUser !== undefined) {
    if (userStore.isNewUser) {
      router.push("/welcome").then(() => {});
    } else {
      router.push("/").then(() => {});
    }
    return <div>Loading</div>;
  }

  return (
    <div className={"flex"}>
      <div
        className={`${loginStyles["login-form"]} ${loginStyles[theme]} elevation__navigation-drawer__modal-side-bottom-sheet__etc`}
      >
        <h1 className={`sr-only`}>{PROJECT_TITLE}</h1>
        <Image
          className={`${loginStyles["title"]}`}
          title={PROJECT_TITLE}
          src={logo}
          alt={"logo image"}
          width={220}
          height={42}
          priority={true}
        ></Image>
        <h2 className={`sr-only`}>{PROJECT_SUB_TITLE}</h2>
        <div className={`${loginStyles["sub-title"]} typography__text--big`}>
          {PROJECT_SUB_TITLE}
        </div>
        <GoogleLoginButton />
        <GithubLoginButton />
      </div>
    </div>
  );
};

const GoogleLoginButton = () => {
  const { userStore } = useStores();
  return (
    <>
      <h2 className={`sr-only`}>{GOOGLE_LOGIN_BUTTON_TEXT}</h2>
      <button
        className={`${loginStyles["google-login-button"]} elevation__card__search-bar__contained-button--waiting__etc`}
        onClick={() => userStore.signInWithGoogle()}
      >
        <div className={`${loginStyles["logoWithText"]}`}>
          <Image
            src={google_logo}
            alt={"google_logo"}
            width={18}
            height={18}
          ></Image>
          <p className={`${loginStyles["button_text"]}`}>
            {GOOGLE_LOGIN_BUTTON_TEXT}
          </p>
        </div>
      </button>
    </>
  );
};

const GithubLoginButton = () => {
  const { userStore } = useStores();
  return (
    <>
      <h2 className={`sr-only`}>{GITHUB_LOGIN_BUTTON_TEXT}</h2>
      <button
        className={`${loginStyles["github-login-button"]} elevation__card__search-bar__contained-button--waiting__etc`}
        onClick={() => userStore.signInWithGithub()}
      >
        <div className={`${loginStyles["logoWithText"]}`}>
          <Image
            src={github_logo}
            alt={"github_logo"}
            width={20}
            height={20}
          ></Image>
          <p className={`${loginStyles["button_text"]}`}>
            {GITHUB_LOGIN_BUTTON_TEXT}
          </p>
        </div>
      </button>
    </>
  );
};

export default observer(Login);
