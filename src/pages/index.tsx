import Image from "next/image";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import {
  IMAGE_SERVER_URL,
  USER_DEFAULT_IMAGE_SRC,
} from "@/constants/image.constant";
import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { useRouter } from "next/router";
import { verifyUserToken } from "@/service/verifyUserToken";
import { CropsType } from "@/models/crop/CropsType";
import { fetchAbsolute } from "@/utils/fetchAbsolute";
import { useStores } from "@/stores/context";
import { Crop } from "@/models/crop/Crop";
import { SideMenuBar } from "@/components/SideMenuBar";
import { Header } from "@/components/Header";

// TODO 페이지 들어갈 때 유저 쿠키가 유효한지 판단함. 중복되는 코드라서 따로 빼보는 방법 찾아 볼 것.
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return await verifyUserToken(ctx);
};

const HarvestedCropGroup: NextPage<{ items: Crop[] }> = observer(
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
  const [src, setSrc] = useState(props.uid);
  const [errorMessage, setErrorMessage] = useState("");
  const { cropStore, userStore } = useStores();
  // TODO(민성): UserProfileImage와 중복되는 코드 제거하기.
  const userProfileImageLoader = ({ src }: { src: string }): string => {
    return `${IMAGE_SERVER_URL}/users/${src}.png`;
  };
  const loggingUserInformation = () => {
    console.log(JSON.stringify(userStore.currentUser));
  };

  // 테스트용
  const setCrop = async () => {
    const data = {
      userId: "B9j6GEh2PTSHgcrdNnNBRVAPkuX2",
      cropType: CropsType.STRAWBERRY,
    };
    await fetchAbsolute("/api/crops", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
  };

  useEffect(() => {
    setErrorMessage(
      userStore.errorMessage == undefined ? "" : userStore.errorMessage
    );
  }, []);

  return (
    <section className={"box"}>
      <div className={"box-header-margin"}>
        <Header userId={props.uid} />
      </div>
      <div className={"box-contents-margin"}>
        <div className={"box-contents"}>
          <div className={"box-contents-side-menu"}>
            <SideMenuBar userId={props.uid}></SideMenuBar>
          </div>
          <div className={"box-contents-item"}>
            {/* TODO(민성): UserProfileImage와 중복되는 코드 제거하기.*/}
            <div>
              <Image
                width={150}
                height={150}
                loader={userProfileImageLoader}
                src={src}
                alt={"user profile image"}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  setSrc(USER_DEFAULT_IMAGE_SRC);
                }}
              ></Image>
              <button onClick={() => loggingUserInformation()}>
                getUserInformation
              </button>
              <button onClick={() => router.push(`/users/${props.uid}`)}>
                내 프로필
              </button>
              <button onClick={() => setCrop()}>작물</button>
              <button
                onClick={() => {
                  cropStore.getHarvestedCrops();
                }}
              >
                인벤토리
              </button>
              <button
                onClick={() =>
                  userStore.signOut().then(() => {
                    router.push("/login");
                  })
                }
              >
                sign out
              </button>
              <HarvestedCropGroup items={cropStore.harvestedCrops} />
              <div>{errorMessage}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default observer(Home);
