import { Header } from "@/components/Header";
import { SideMenuBar } from "@/components/SideMenuBar";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/service/firebase";
import router from "next/router";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export const Layout = (props: { children: React.ReactNode }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <LoadingSpinner />;
  }
  if (!user) {
    router.replace("/login");
    return <div>Please sign in to continue</div>;
  }

  return (
    <section className={"box"}>
      <div className={"box-header-margin"}>
        <Header userId={user.uid} />
      </div>
      <div className={"box-contents-margin"}>
        <div className={"box-contents"}>
          <div className={"box-contents-side-menu"}>
            <SideMenuBar userId={user.uid}></SideMenuBar>
          </div>
          <div className={"box-contents-item"}>{props.children}</div>
        </div>
      </div>
    </section>
  );
};
