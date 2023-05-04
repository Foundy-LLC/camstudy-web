import { NextPage } from "next";
import { Layout } from "@/components/Layout";
import Image from "next/image";
import { useStores } from "@/stores/context";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/service/firebase";
import router from "next/router";
import cropStyles from "@/styles/crop.module.scss";

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
    <div className={`${cropStyles["my-pot"]}`}>
      <div>내 화분</div>
      <div className={`${cropStyles["my-pot_content"]}`}>
        <div className={`${cropStyles["growing-crop_image"]}`}>
          {cropStore.cropImageSrc != undefined ? (
            <Image
              width={156}
              height={156}
              src={cropStore.cropImageSrc}
              alt={"작물"}
            />
          ) : (
            "작물이 죽었거나 심은 작물이 없으면 추가하는 버튼"
          )}
        </div>
        <div className={`${cropStyles["growing-crop_explain"]}`}>
          <div>
            <span className={`${cropStyles["growing-crop_explain_title"]}`}>
              작물 이름
            </span>
            <span
              className={`${cropStyles["growing-crop_explain_content"]}`}
            ></span>
          </div>
          <div>
            <span className={`${cropStyles["growing-crop_explain_title"]}`}>
              수확 예정일
            </span>
            <span
              className={`${cropStyles["growing-crop_explain_content"]}`}
            ></span>
          </div>
          <div>
            <span className={`${cropStyles["growing-crop_explain_title"]}`}>
              평균 공부시간
            </span>
            <span
              className={`${cropStyles["growing-crop_explain_content"]}`}
            ></span>
          </div>
          <div>
            <span className={`${cropStyles["growing-crop_explain_title"]}`}>
              예상 작물등급
            </span>
            <span
              className={`${cropStyles["growing-crop_explain_content"]}`}
            ></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default crop;
