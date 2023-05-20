import { NextPage } from "next";
import { Layout } from "@/components/Layout";
import Image from "next/image";
import { useStores } from "@/stores/context";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/service/firebase";
import router from "next/router";
import cropStyles from "@/styles/crop.module.scss";
import cropListPopupStyles from "@/styles/cropListPopup.module.scss";
import { observer } from "mobx-react";
import { Crops, CROPS } from "@/constants/crops";
import { GrowingCrop } from "@/models/crop/GrowingCrop";
import { fruit_grade } from "@prisma/client";
import Modal from "react-modal";

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
  const [open, setOpen] = useState<boolean>(false);

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
              <Image
                width={156}
                height={156}
                src={cropStore.cropImageSrc!}
                alt={"작물"}
                style={
                  cropStore.growingCrop.isDead
                    ? { filter: "grayscale(100%)" }
                    : {}
                }
              />
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
                  {!cropStore.growingCrop.isDead
                    ? `${cropStore.growingCrop!.level}단계`
                    : `죽음`}
                </span>
                <span
                  className={`${cropStyles["growing-crop_explain_content"]}`}
                >
                  {!cropStore.growingCrop.isDead
                    ? `${new Date(
                        cropStore.growingCrop.plantedAt
                      ).getFullYear()}년   
                    ${
                      new Date(cropStore.growingCrop.plantedAt).getMonth() + 1
                    }월 
                    ${new Date(cropStore.growingCrop.plantedAt).getDate()}일 
                    ${new Date(cropStore.growingCrop.plantedAt).getHours()}시 
                    ${new Date(cropStore.growingCrop.plantedAt).getMinutes()}분`
                    : "-"}
                </span>
              </div>
              <hr
                style={{
                  border: "none",
                  height: "1px",
                  backgroundColor: "var(--system_ui-03)",
                  margin: "20px 20px 20px 0",
                }}
              />
              <div
                className={`${cropStyles["growing-crop_explain_item"]} typography__text--big`}
              >
                <span
                  className={`${cropStyles["growing-crop_explain_title"]}`}
                  style={{ marginRight: 33 }}
                >
                  수확 예정일
                </span>
                <span
                  className={`${cropStyles["growing-crop_explain_content"]}`}
                >
                  {!cropStore.growingCrop.isDead
                    ? getRemainTime(cropStore.growingCrop)
                    : "-"}
                </span>
              </div>
              <div
                className={`${cropStyles["growing-crop_explain_item"]} typography__text--big`}
              >
                <span
                  className={`${cropStyles["growing-crop_explain_title"]}`}
                  style={{ marginRight: 16 }}
                >
                  평균 공부시간
                </span>
                <span
                  className={`${cropStyles["growing-crop_explain_content"]}`}
                >
                  {!cropStore.growingCrop.isDead
                    ? convertAvgStudyTimeToText(
                        cropStore.growingCrop.averageStudyTimes
                      )
                    : "-"}
                </span>
              </div>
              <div
                className={`${cropStyles["growing-crop_explain_item"]} typography__text--big`}
              >
                <span
                  className={`${cropStyles["growing-crop_explain_title"]}`}
                  style={{ marginRight: 16 }}
                >
                  예상 작물등급
                </span>
                <span
                  className={`${cropStyles["growing-crop_explain_content"]}`}
                >
                  {!cropStore.growingCrop.isDead
                    ? convertLevelToString(cropStore.growingCrop.expectedGrade)
                    : "-"}
                </span>
              </div>
            </div>
          </div>
          {!cropStore.growingCrop.isDead ? (
            <button
              className={`${cropStyles["my-pot_button"]}`}
              disabled={harvestable(cropStore.growingCrop)}
              onClick={() => {
                if (confirm("작물을 수확하시겠습니까?")) {
                  cropStore.harvestCrops(user.uid);
                }
              }}
            >
              수확하기
            </button>
          ) : (
            <button
              className={`${cropStyles["my-pot_button"]}`}
              onClick={() => {
                if (confirm("작물을 제거하시겠습니까?")) {
                  cropStore.removeCrop(user.uid, cropStore.growingCrop!.id);
                }
              }}
            >
              제거하기
            </button>
          )}
        </>
      ) : (
        <>
          <div className={`${cropStyles["my-pot_title"]}`}>
            <span className="material-symbols-outlined">grass</span>내 화분
          </div>
          <div className={`${cropStyles["my-pot_content"]}`}>
            <div
              className={`${cropStyles["growing-crop_image"]}`}
              style={{ marginBottom: 32 }}
            >
              <span className="material-symbols-outlined">help</span>
              <style jsx>{`
                .material-symbols-outlined {
                  font-size: 96px;
                  margin: auto;
                  font-variation-settings: "FILL" 1, "wght" 700, "GRAD" 0,
                    "opsz" 48;
                }
              `}</style>
            </div>
            <div
              className={`${cropStyles["growing-crop_explain"]}`}
              style={{ alignItems: "center", margin: "auto" }}
            >
              <div
                className={`${cropStyles["growing-crop_explain_title--empty"]} typography__sub-headline`}
                style={{ marginBottom: "20px" }}
              >
                화분이 비어있습니다
              </div>
              <button
                className={`${cropStyles["my-pot_button"]}`}
                style={{ width: "133px", margin: 0 }}
                onClick={() => setOpen(true)}
              >
                화분에 작물 심기
              </button>
            </div>
          </div>
          <Modal
            isOpen={open}
            onRequestClose={() => setOpen(false)}
            style={{
              content: {
                width: 380,
                height: 768,
                borderRadius: 20,
                backgroundColor: "var(--ui-cardui)",
                padding: 10,
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              },
            }}
          >
            <CropListPopup userId={user.uid}></CropListPopup>
          </Modal>
        </>
      )}
    </div>
  );
});

export const CropListPopup: NextPage<{
  userId: string;
}> = ({ userId }) => {
  const { cropStore } = useStores();
  const [selectedOption, setSelectedOption] = useState<Crops>(CROPS[0]);

  const handleOptionChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    CROPS.find((crop) => {
      if (crop.type === e.target.value) return setSelectedOption(crop);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className={`${cropListPopupStyles["popupTitle"]}`}>
        <span className="material-symbols-outlined">nest_eco_leaf</span>작물
        심기
      </div>
      <div style={{ display: "flex", flexGrow: 1, marginLeft: 10 }}>
        <div className={`${cropListPopupStyles["selectedCropImageBox"]}`}>
          <Image
            alt={"img"}
            src={selectedOption.harvestedImageUrl[1]}
            width={80}
            height={80}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            gap: 16,
          }}
        >
          <div className={`${cropListPopupStyles["selectedCropTitle"]}`}>
            <span className={`${cropListPopupStyles["selectedCropName"]}`}>
              {convertCropTypeToCropName(selectedOption)}
            </span>
            <span
              className={`${cropListPopupStyles["selectedCropTotalLevel"]}`}
            >{`총 ${selectedOption.imageUrls.length}단계`}</span>
          </div>
          <div className={`${cropListPopupStyles["selectedCropRequiredDay"]}`}>
            <span
              className={`typography__text--big ${cropListPopupStyles["requiredDayTitle"]}`}
            >
              수확 소요시간
            </span>
            <span
              className={`typography__text--big ${cropListPopupStyles["requiredDay"]}`}
            >
              {selectedOption.requireDay}일
            </span>
          </div>
          <button
            className={`${cropListPopupStyles["plantingButton"]}`}
            onClick={() => {
              cropStore.plantingCrop(userId, selectedOption.type);
            }}
          >
            작물 심기
          </button>
        </div>
      </div>
      <hr
        style={{
          border: "none",
          height: "1px",
          backgroundColor: "var(--system_ui-03)",
          margin: "20px 0",
        }}
      />
      <div>
        {CROPS.map((crop, idx) => {
          return (
            <label
              className={`${cropListPopupStyles["cropItem"]} ${
                crop.type === selectedOption.type
                  ? `${cropListPopupStyles["active"]}`
                  : ""
              }`}
              style={{ display: "flex", paddingLeft: 10 }}
              key={idx}
            >
              <input
                type={"radio"}
                name={"cropList"}
                value={crop.type}
                checked={selectedOption.type === crop.type}
                onChange={handleOptionChange}
              />
              <div
                className={`${
                  crop.type === selectedOption.type
                    ? `${cropListPopupStyles["cropListItemBox--active"]}`
                    : `${cropListPopupStyles["cropListItemBox"]}`
                }`}
              >
                <Image
                  src={crop.harvestedImageUrl[1]}
                  alt={`Option ${idx + 1}`}
                  width={48}
                  height={48}
                />
              </div>
              <div>
                <div className={cropListPopupStyles["itemTitle"]}>
                  {convertCropTypeToCropName(crop)}
                </div>
                <div className={cropListPopupStyles["itemIntroduce"]}>
                  {crop.introduce}
                </div>
              </div>
            </label>
          );
        })}
      </div>
      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
        }

        /* HIDE RADIO */
        [type="radio"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  );
};

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
                    convertLevelToIndex(harvestedCrop.grade)
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

const convertAvgStudyTimeToText = (studyTime: number) => {
  let totalMinutes = Math.floor(studyTime * 60); // 공부한 총 분 수
  let hours = Math.floor(totalMinutes / 60); // 시간 구하기
  let minutes = totalMinutes % 60; // 분 구하기

  return `${hours}시간 ${minutes}분`; // 출력: "0시간 45분"
};

export const convertLevelToIndex = (grade: fruit_grade) => {
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

export const convertLevelToString = (grade: string) => {
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

const convertCropTypeToCropName = (crop: Crops) => {
  switch (crop.type) {
    case "cabbage":
      return "양배추";
    case "strawberry":
      return "딸기";
    case "tomato":
      return "토마토";
    case "pumpkin":
      return "호박";
    case "carrot":
      return "당근";
  }
};

const getRemainTime = (crop: GrowingCrop) => {
  const requiredDay = getRequireDay(crop);
  const plantedAt = crop.plantedAt;
  const currentDay = new Date();
  const harvestedAt = new Date(
    new Date(plantedAt).setDate(new Date(plantedAt).getDate() + requiredDay)
  );

  const gap = harvestedAt.valueOf() - currentDay.valueOf();

  let hour = Math.floor(gap / 3600000);
  let minute = Math.floor((gap % 3600000) / 60000);

  if (hour < 0) {
    hour = 0;
  }
  if (minute < 0) {
    minute = 0;
  }
  return `${hour}시간 ${minute}분 남음`;
};

const harvestable = (crop: GrowingCrop) => {
  const requiredDay = getRequireDay(crop);
  const plantedAt = crop.plantedAt;
  const currentDay = new Date();
  const harvestedAt = new Date(
    new Date(plantedAt).setDate(new Date(plantedAt).getDate() + requiredDay)
  );

  const gap = harvestedAt.getDate() - currentDay.getDate();

  let hour = Math.floor(gap / 3600000);
  let minute = Math.floor((gap % 3600000) / 60000);

  return !(hour < 0 && minute < 0);
};

export default crop;
