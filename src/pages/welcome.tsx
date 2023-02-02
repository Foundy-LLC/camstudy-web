import { useAuthState } from "react-firebase-hooks/auth";
import React, { useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { auth } from "src/service/firebase";
import { UserRequestBody } from "@/models/user/UserRequestBody";

const Welcome: NextPage = () => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const uid = user?.uid;
  const [name, setName] = useState("");
  const [introduce, setIntroduce] = useState("");
  const [tags, setTags] = useState("");

  if (uid == null) {
    return <div>회원 정보가 존재하지 않습니다.</div>;
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.id) {
      case "name":
        setName(e.target.value); //이벤트 발생한 value값으로 {text} 변경
        break;
      case "introduce":
        setIntroduce(e.target.value);
        break;
      case "tags":
        setTags(e.target.value);
        break;
    }
  };

  const createUser = async () => {
    const response = await fetch(`api/users`, {
      method: "POST",
      body: JSON.stringify(
        new UserRequestBody(uid, name, introduce, tags.split(" "))
      ),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response.json());
  };

  if (loading) {
    return <div>Loading</div>;
  }
  if (!user) {
    router.push("/login");
    return <div>Please sign in to continue</div>;
  }

  return (
    <div>
      <input
        id={"name"}
        type={"text"}
        onChange={(e) => onChange(e)}
        value={name}
      />
      <br />
      <input
        id={"introduce"}
        type={"text"}
        onChange={(e) => onChange(e)}
        value={introduce}
      />
      <br />
      <input
        id={"tags"}
        type={"text"}
        onChange={(e) => onChange(e)}
        value={tags}
      />
      <br />
      <button onClick={() => createUser()}>확인</button>
      <br />

      <button onClick={() => auth.signOut()}>Sign out</button>
    </div>
  );
};
export default Welcome;
