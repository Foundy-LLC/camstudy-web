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
import { GrowingCrop } from "@/models/crop/GrowingCrop";
import { fruit_grade } from "@prisma/client";

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
                  {getRemainTime(cropStore.growingCrop)}
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
                  {revertAvgStudyTimeToText(
                    cropStore.growingCrop.averageStudyTimes
                  )}
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
                  {revertLevelToString(cropStore.growingCrop.expectedGrade)}
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
                url={
                  crop.harvestedImageUrl[
                    revertLevelToIndex(harvestedCrop.grade)
                  ]
                }
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

const revertAvgStudyTimeToText = (studyTime: number) => {
  let totalMinutes = Math.floor(studyTime * 60); // 공부한 총 분 수
  let hours = Math.floor(totalMinutes / 60); // 시간 구하기
  let minutes = totalMinutes % 60; // 분 구하기

  return `${hours}시간 ${minutes}분`; // 출력: "0시간 45분"
};

const revertLevelToIndex = (grade: fruit_grade) => {
  switch (grade) {
    case "diamond":
      return 4;
    case "gold":
      return 3;
    case "silver":
      return 2;
    case "fresh":
      return 1;
    case "not_fresh":
      return 0;
  }
};

const revertLevelToString = (grade: string) => {
  switch (grade) {
    case "diamond":
      return "다이아";
    case "gold":
      return "골드";
    case "silver":
      return "실버";
    case "fresh":
      return "싱싱함";
    case "not_fresh":
      return "살짝 시들음";
  }
};

const getRequireDay = (crop: GrowingCrop) => {
  switch (crop.type) {
    case "cabbage":
      return 11;
    case "strawberry":
      return 7;
    case "tomato":
      return 5;
    case "pumpkin":
      return 9;
    case "carrot":
      return 3;
  }
};

const getRemainTime = (crop: GrowingCrop) => {
  const requiredDay = getRequireDay(crop);
  const plantedAt = crop.plantedAt;
  const currentDay = new Date();
  const harvestedAt = new Date(
    new Date(plantedAt).setDate(new Date(plantedAt).getDate() + requiredDay)
  );

  const gap = harvestedAt.getDate() - currentDay.getDate();

  let hour = Math.floor(gap / 3600000);
  let minute = Math.floor((gap % 3600000) / 60000);

  if (hour < 0 || minute < 0) {
    hour = 0;
    minute = 0;
  }
  return `${hour}시간 ${minute}분 남음`;
};

export default crop;
