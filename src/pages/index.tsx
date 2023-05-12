import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { IMAGE_SERVER_URL } from "@/constants/image.constant";
import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { useRouter } from "next/router";
import { verifyUserToken } from "@/service/verifyUserToken";
import { fetchAbsolute } from "@/utils/fetchAbsolute";
import { useStores } from "@/stores/context";
import { HarvestedCrop } from "@/models/crop/HarvestedCrop";
import { Layout } from "@/components/Layout";
import { crops_type } from "@prisma/client";
import { RoomItemGroup } from "@/pages/rooms";
import dashboardStyles from "@/styles/dashboard.module.scss";
import Image from "next/image";
import {
  ProfileDialog,
  ProfileDialogContainer,
} from "@/components/ProfileDialog";

// TODO 페이지 들어갈 때 유저 쿠키가 유효한지 판단함. 중복되는 코드라서 따로 빼보는 방법 찾아 볼 것.
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return await verifyUserToken(ctx);
};

const HarvestedCropGroup: NextPage<{ items: HarvestedCrop[] }> = observer(
  ({ items }) => {
    return (
      <>
        {items.map((item, key) => (
          <div key={key}>
            <p>
              {key + 1}.{item.type}({item.grade})
            </p>
          </div>
        ))}
      </>
    );
  }
);

function Home(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [uid, setUid] = useState(props.uid);
  const [errorMessage, setErrorMessage] = useState("");
  const { cropStore, userStore } = useStores();
  // TODO(민성): UserProfileImage와 중복되는 코드 제거하기.
  const userProfileImageLoader = ({ src }: { src: string }): string => {
    return `${IMAGE_SERVER_URL}/users/${src}.png`;
  };
  // 테스트용
  const setCrop = async () => {
    const data = {
      userId: "B9j6GEh2PTSHgcrdNnNBRVAPkuX2",
      cropType: crops_type.strawberry,
    };
    await fetchAbsolute("/api/crops", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
  };

  const { roomListStore } = useStores();

  useEffect(() => {
    userStore.fetchCurrentUser(uid);
    roomListStore.setMasterId(uid);
    roomListStore.fetchRooms();
  }, []);

  useEffect(() => {
    setErrorMessage(
      userStore.errorMessage == undefined ? "" : userStore.errorMessage
    );
  }, []);

  return (
    <>
      <Layout>
        <div className={"typography__sub-headline"} style={{ padding: "20px" }}>
          대시보드
        </div>
        <Dashboard userId={uid} />
        <RoomItemGroup items={roomListStore.roomOverviews} />
        {roomListStore.errorMessage === undefined ? null : (
          <h3>{roomListStore.errorMessage}</h3>
        )}
      </Layout>
    </>
  );
}

export const Dashboard: NextPage<{ userId: string }> = observer(
  ({ userId }) => {
    const { cropStore } = useStores();
    const [exist, setExist] = useState<boolean>(false);

    useEffect(() => {
      cropStore.fetchGrowingCrop(userId);
    }, []);

    useEffect(() => {
      if (cropStore.growingCrop != null && !cropStore.growingCrop.isDead)
        setExist(true);
    }, [cropStore.growingCrop]);

    return (
      <div className={"dashboard"}>
        <div className={`${dashboardStyles["box"]}`}>
          <div className={`${dashboardStyles["inner-box"]}`}>
            <div className={`${dashboardStyles["title"]}`}>
              <span className="material-symbols-outlined">schedule</span>
              <span>주간 공부시간</span>
            </div>
            <div className={`${dashboardStyles["content"]}`}>
              <div
                className={"typography__title1--big time"}
                style={{ color: "#DDA30E" }}
              >
                56:38:17
              </div>
              <div
                className={`typography__text ${dashboardStyles["content-text"]}`}
              >
                전체 유저 기준 상위 6%
              </div>
            </div>
          </div>
        </div>

        <div className={`${dashboardStyles["box"]}`}>
          <div className={`${dashboardStyles["inner-box"]}`}>
            <div className={`${dashboardStyles["title"]}`}>
              <span className="material-symbols-outlined">insert_chart</span>
              <span>이번 주 랭킹</span>
            </div>
            <div className={`${dashboardStyles["content"]}`}>
              <div
                className={"typography__title1--big time"}
                style={{ color: "#DDA30E" }}
              >
                7위
              </div>
              <div
                className={`typography__text ${dashboardStyles["content-text"]}`}
              >
                전체 유저 기준 862등
              </div>
            </div>
          </div>
        </div>
        {exist ? <CropDashBoard /> : ""}

        <style jsx>{`
          .dashboard {
            display: flex;
            gap: 20px;
            margin: auto auto 24px;
          }

          .material-symbols-outlined {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
          }
        `}</style>
      </div>
    );
  }
);

const CropDashBoard = () => {
  const { cropStore } = useStores();

  return (
    <div className={`${dashboardStyles["box"]}`}>
      <div className={`${dashboardStyles["crop-inner-box"]}`}>
        <div className={`${dashboardStyles["title"]}`}>
          <span className="material-symbols-outlined">eco</span>
          <span>내 작물</span>
        </div>
        <div className={`${dashboardStyles["content"]}`}>
          {cropStore.cropImageSrc != undefined ? (
            <>
              <Image
                width={96}
                height={96}
                src={cropStore.cropImageSrc}
                alt={"작물"}
              />
              <div
                className={`${dashboardStyles["content-text"]} typography__text`}
              >{`${cropStore.cropName} ${
                cropStore.growingCrop!.level
              }단계`}</div>
            </>
          ) : (
            "작물을 등록하세요."
          )}
        </div>
      </div>
      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
        }
      `}</style>
    </div>
  );
};

export default observer(Home);
