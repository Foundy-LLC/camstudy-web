import { useAuthState } from "react-firebase-hooks/auth";
import React, { useEffect } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { auth } from "src/service/firebase";
import welcomeStore from "@/stores/WelcomeStore";
import { observer } from "mobx-react";

const Welcome: NextPage = () => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const successToCreate = welcomeStore.successToCreate;

  useEffect(() => {
    if (successToCreate) {
      router.push("/");
    }
  }, [successToCreate]);

  if (loading) {
    return <div>Loading</div>;
  }
  if (!user) {
    router.push("/login");
    return <div>Please sign in to continue</div>;
  }
  const uid = user?.uid;

  return (
    <div>
      <input
        id={"name"}
        type={"text"}
        onChange={(e) => welcomeStore.changeName(e.target.value)}
        value={welcomeStore.name}
      />
      <br />
      <input
        id={"introduce"}
        type={"text"}
        onChange={(e) => welcomeStore.changeIntroduce(e.target.value)}
        value={welcomeStore.introduce}
      />
      <br />
      <input
        id={"tags"}
        type={"text"}
        onChange={(e) => welcomeStore.changeTags(e.target.value)}
        value={welcomeStore.tags}
      />
      <br />
      <button onClick={() => welcomeStore.createUser(uid)}>확인</button>
      <br />

      <button onClick={() => auth.signOut()}>Sign out</button>

      <div>
        {welcomeStore.errorMessage != null
          ? welcomeStore.errorMessage
          : undefined}
      </div>
    </div>
  );
};
export default observer(Welcome);
