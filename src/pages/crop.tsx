import { NextPage } from "next";
import { Layout } from "@/components/Layout";
import Image from "next/image";
import { useStores } from "@/stores/context";
import { useAuth } from "@/components/AuthProvider";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/service/firebase";
import router from "next/router";

const crop: NextPage = () => {
  return (
    <Layout>
      <MyPot></MyPot>
    </Layout>
  );
};

const MyPot: NextPage = () => {
  const { cropStore } = useStores();
  const [user, loading] = useAuthState(auth);
  const [exist, setExist] = useState<boolean>(false);

  if (loading) {
    return <div>Loading</div>;
  }
  if (!user) {
    router.replace("/login");
    return <div>Please sign in to continue</div>;
  }

  useEffect(() => {
    cropStore.fetchGrowingCrop(user.uid);
  }, []);

  useEffect(() => {
    if (cropStore.growingCrop != null && !cropStore.growingCrop.isDead)
      setExist(true);
  }, [cropStore.growingCrop]);

  return (
    <div>
      <div>내 화분</div>
      <div>
        <div>
          {cropStore.cropImageSrc != undefined ? (
            <Image
              width={96}
              height={96}
              src={cropStore.cropImageSrc}
              alt={"작물"}
            />
          ) : (
            "작물이 죽었거나 심은 작물이 없으면 추가하는 버튼"
          )}
        </div>
        <div>
          <div>작물 이름</div>
          <div>수확 예정일</div>
          <div>평균 공부시간</div>
          <div>예상 작물등급</div>
        </div>
      </div>
    </div>
  );
};

export default crop;
