import { NextPage } from "next";
import { Layout } from "@/components/Layout";
import Image from "next/image";
import { useStores } from "@/stores/context";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/service/firebase";
import router from "next/router";
import cropStyles from "@/styles/crop.module.scss";
import { observer } from "mobx-react";
import { CROPS } from "@/constants/crops";

const crop: NextPage = () => {
  return (
    <Layout>
      <h1 className={"typography__sub-headline"}>내 작물 관리하기</h1>
      <MyPot></MyPot>
      <MyPlants></MyPlants>
      <style jsx>{`
        h1 {
          margin-left: 20px;
        }
      `}</style>
    </Layout>
  );
};

const MyPot: NextPage = observer(() => {
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
    cropStore.fetchHarvestedCrops(user.uid);
  }, []);

  useEffect(() => {
    if (cropStore.growingCrop != null && !cropStore.growingCrop.isDead) {
      setExist(true);
    }
  }, [cropStore.growingCrop]);

  return (
    <div className={`${cropStyles["my-pot"]}`}>
      {cropStore.growingCrop != undefined ? (
        <>
          <div className={`${cropStyles["my-pot_title"]}`}>
            <span className="material-symbols-outlined">grass</span>내 화분
          </div>
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
              <div
                className={`${cropStyles["growing-crop_explain_item--big"]}`}
              >
                <span
                  className={`${cropStyles["growing-crop_explain_title--big"]}`}
                >
                  {`${cropStore.cropName}`}
                </span>
                <span
                  className={`${cropStyles["growing-crop_explain_title--box"]} typography__text--big`}
                >
                  {`${cropStore.growingCrop!.level}단계`}
                </span>
                <span
                  className={`${cropStyles["growing-crop_explain_content"]}`}
                >
                  {`${new Date(
                    cropStore.growingCrop.plantedAt
                  ).getFullYear()}년 
                    ${
                      new Date(cropStore.growingCrop.plantedAt).getMonth() + 1
                    }월 
                    ${new Date(cropStore.growingCrop.plantedAt).getDate()}일 
                    ${new Date(cropStore.growingCrop.plantedAt).getHours()}시 
                    ${new Date(
                      cropStore.growingCrop.plantedAt
                    ).getMinutes()}분`}
                </span>
              </div>
              <div
                className={`${cropStyles["growing-crop_explain_item"]} typography__text--big`}
              >
                <span className={`${cropStyles["growing-crop_explain_title"]}`}>
                  수확 예정일
                </span>
                <span
                  className={`${cropStyles["growing-crop_explain_content"]}`}
                >
                  {}
                </span>
              </div>
              <div
                className={`${cropStyles["growing-crop_explain_item"]} typography__text--big`}
              >
                <span className={`${cropStyles["growing-crop_explain_title"]}`}>
                  평균 공부시간
                </span>
                <span
                  className={`${cropStyles["growing-crop_explain_content"]}`}
                >
                  {cropStore.growingCrop.averageStudyTimes}
                </span>
              </div>
              <div
                className={`${cropStyles["growing-crop_explain_item"]} typography__text--big`}
              >
                <span className={`${cropStyles["growing-crop_explain_title"]}`}>
                  예상 작물등급
                </span>
                <span
                  className={`${cropStyles["growing-crop_explain_content"]}`}
                >
                  {cropStore.growingCrop.expectedGrade}
                </span>
              </div>
            </div>
          </div>
          <button className={`${cropStyles["my-pot_button"]}`}>수확하기</button>
        </>
      ) : (
        ""
      )}
    </div>
  );
});

const MyPlants: NextPage = observer(() => {
  const { cropStore } = useStores();

  console.log(cropStore.harvestedCrops);

  return (
    <div className={`${cropStyles["my-plants"]}`}>
      <div className={`${cropStyles["my-plants_title"]}`}>
        <span className="material-symbols-outlined">potted_plant</span>내 작물
        <style jsx>{`
          .material-symbols-outlined {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
          }
        `}</style>
      </div>
      <div className={`${cropStyles["my-pot_content"]}`}>
        {cropStore.harvestedCrops.map((harvestedCrop, key) => {
          return CROPS.map((crop) => {
            return harvestedCrop.type === crop.type ? (
              <PlantBox
                url={crop.imageUrls[crop.imageUrls.length - 1]}
                key={key}
              ></PlantBox>
            ) : null;
          });
        })}
      </div>
    </div>
  );
});

const PlantBox: NextPage<{ url: string }> = ({ url }) => {
  return (
    <div className={`${cropStyles["my-plants_box"]}`}>
      <Image src={url} alt={"plant_img"} width={80} height={80}></Image>
    </div>
  );
};

export default crop;
