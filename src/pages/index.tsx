import { observer } from "mobx-react";
import React, { Suspense, useEffect, useState } from "react";
import { IMAGE_SERVER_URL } from "@/constants/image.constant";
import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { useRouter } from "next/router";
import { verifyUserToken } from "@/service/verifyUserToken";
import { useStores } from "@/stores/context";
import { HarvestedCrop } from "@/models/crop/HarvestedCrop";
import { Layout } from "@/components/Layout";
import { RoomItemGroup } from "@/pages/rooms";
import dashboardStyles from "@/styles/dashboard.module.scss";
import homeStyles from "@/styles/index.module.scss";
import Image from "next/image";
import { timeToString } from "@/components/TimeToString";
import Modal from "react-modal";
import { CropListPopup } from "@/pages/crop";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// TODO 페이지 들어갈 때 유저 쿠키가 유효한지 판단함. 중복되는 코드라서 따로 빼보는 방법 찾아 볼 것.
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return await verifyUserToken(ctx);
};

function Home(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [uid, setUid] = useState(props.uid);
  const [errorMessage, setErrorMessage] = useState("");
  const { cropStore, userStore } = useStores();
  // TODO(민성): UserProfileImage와 중복되는 코드 제거하기.
  const userProfileImageLoader = ({ src }: { src: string }): string => {
    return `${IMAGE_SERVER_URL}/users/${src}.png`;
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
        <div className={`${homeStyles["home-page"]}`}>
          <div
            className={`${homeStyles["home-page__title"]} typography__sub-headline`}
            style={{ padding: "20px" }}
          >
            대시보드
          </div>
          <div className={`${homeStyles["dashboard-frame"]}`}>
            <Dashboard userId={uid} />
          </div>
          <div className={`${homeStyles["room-list-frame"]}`}>
            <RoomItemGroup items={roomListStore.roomOverviews} />
          </div>
        </div>
      </Layout>
    </>
  );
}

export const Dashboard: NextPage<{ userId: string }> = observer(
  ({ userId }) => {
    const { cropStore, rankStore } = useStores();
    const [exist, setExist] = useState<boolean>(false);

    useEffect(() => {
      cropStore.fetchGrowingCrop(userId);
      rankStore.getUserTotalRank(userId);
      rankStore.getUserWeeklyRank(userId);
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
                {rankStore.userWeekRank &&
                  timeToString(rankStore.userWeekRank.studyTime)}
              </div>
              <div
                className={`typography__text ${dashboardStyles["content-text"]}`}
              >
                전체 유저 기준 상위 {rankStore.totalPercentile}%
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
                {rankStore.userWeekRank?.ranking}위
              </div>
              <div
                className={`typography__text ${dashboardStyles["content-text"]}`}
              >
                전체 유저 기준 {rankStore.userTotalRank?.ranking}등
              </div>
            </div>
          </div>
        </div>
        <CropDashBoard />

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

export const CropDashBoard = () => {
  const { cropStore, userStore } = useStores();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (cropStore.cropImageSrc) setOpen(false);
  }, [cropStore.cropImageSrc]);
  return (
    <div className={`${dashboardStyles["box"]}`}>
      <div className={`${dashboardStyles["crop-inner-box"]}`}>
        <div className={`${dashboardStyles["title"]}`}>
          <span className="material-symbols-outlined">eco</span>
          <span>내 작물</span>
        </div>
        <div className={`${dashboardStyles["content"]}`}>
          {cropStore.cropImageSrc != undefined ? (
            <Image
              width={96}
              height={96}
              src={cropStore.cropImageSrc}
              alt={"작물"}
            />
          ) : (
            <div className={`${dashboardStyles["content--empty"]}`}>
              <button onClick={() => setOpen(true)}>
                <label>작물 심기</label>
              </button>
            </div>
          )}

          <div
            className={`${dashboardStyles["content-text"]} typography__text`}
          >
            {cropStore.cropImageSrc != undefined
              ? `${cropStore.cropName} ${cropStore.growingCrop!.level}단계`
              : "작물이 없습니다"}
          </div>
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
        {userStore.currentUser && (
          <CropListPopup
            userId={userStore.currentUser.id}
            setOpen={setOpen}
          ></CropListPopup>
        )}
      </Modal>
      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
        }
      `}</style>
    </div>
  );
};

export default observer(Home);
