import { NextPage } from "next";
import React, { useEffect } from "react";
import { UserProfileImage } from "@/components/UserProfileImage";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/service/firebase";
import profileStyles from "@/styles/profile.module.scss";
import Image from "next/image";
import { useStores } from "@/stores/context";
import { observer } from "mobx-react";
import { Layout } from "@/components/Layout";

const UserProfile: NextPage = observer(() => {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const { profileStore, userStore } = useStores();

  useEffect(() => {
    if (!userStore.currentUser) return;
    console.log(userStore.currentUser);
    profileStore.getUserProfile();
  }, [userStore.currentUser]);

  if (loading) {
    return <div>Loading</div>;
  }

  if (!user) {
    router.replace("/login");
    return <div>Please sign in to continue</div>;
  }

  return (
    <>
      <Layout>
        <div>
          <div className={`${profileStyles["page-title"]}`}>
            <label
              className={`${profileStyles["title"]} typography__sub-headline`}
            >
              내 프로필
            </label>
            <div className={`${profileStyles["save-button"]} typography__text`}>
              <label>프로필 변경사항 저장하기</label>
            </div>
            <div className={`${profileStyles["undo-button"]} typography__text`}>
              <label>되돌리기</label>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                className={`${profileStyles["profile-image-form"]} elevation__card__search-bar__contained-button--waiting__etc`}
              >
                <div className={`${profileStyles["title"]}`}>
                  <span className="material-symbols-sharp">image</span>
                  <label className={"typography__text--big"}>프로필 사진</label>
                </div>
                <div className={`${profileStyles["image-upload"]}`}>
                  {profileStore.imageUrl === "" ? (
                    <div className={`${profileStyles["image"]}`}></div>
                  ) : (
                    <Image
                      className={`${profileStyles["image"]}`}
                      alt={"selected-img"}
                      src={profileStore.imageUrl}
                      width={152}
                      height={152}
                    />
                  )}
                  <div className={`${profileStyles["precautions"]}`}>
                    <label className={"typography__text--small"}>
                      이런 프로필 사진은 안돼요
                    </label>
                    <ul className={"typography__caption"}>
                      <li>&nbsp;· &nbsp; 타인에게 불쾌감을 줄 수 있는 사진</li>
                      <li>&nbsp;· &nbsp; 5mb을 초과하는 용량의 이미지</li>
                      <li>&nbsp;· &nbsp; 자기 자신이 아닌 타인의 사진 도용</li>
                      <li>&nbsp;· &nbsp; 그 외 부적절하다고 판단되는 사진</li>
                    </ul>
                    <div className={`${profileStyles["image-upload-button"]}`}>
                      <input
                        id="roomThumbnail"
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={(e) => {
                          if (e.target.files) {
                            profileStore.importProfileImage(e.target.files[0]);
                          }
                        }}
                        hidden
                      />
                      <div
                        onClick={() => {
                          document.getElementById("roomThumbnail")!.click();
                        }}
                      >
                        <span className="material-symbols-sharp">image</span>
                        <label className={"typography__text"}>
                          사진 업로드하기
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`${profileStyles["nickname-form"]} elevation__card__search-bar__contained-button--waiting__etc`}
            >
              <div className={`${profileStyles["title"]}`}>
                <span className="material-symbols-sharp">text_snippet</span>
                <label className={"typography__text--big"}>
                  닉네임 및 자기소개
                </label>
              </div>
              <div className={`${profileStyles["nickname"]} `}>
                <label className={"typography__caption"}>닉네임</label>
                <input type={"text"} className={"typography__text--small"} />
                <label className={"typography__caption"}>
                  다른 농부들에게 표시되는 닉네임입니다
                </label>
              </div>
              <div className={`${profileStyles["introduce"]}`}>
                <label className={"typography__caption"}>자기소개</label>
                <input type={"text"} className={"typography__text--small"} />
                <label className={"typography__caption"}>
                  나를 나타낼 수 있는 소개 내용을 입력해주세요
                </label>
              </div>
            </div>
          </div>
        </div>
        <div>
          <UserProfileImage userId={user.uid} width={150} height={150} />
          {profileStore.userOverview && (
            <div>
              <h1>아이디: {profileStore.userOverview.id}</h1>
              <h1>이름: {profileStore.userOverview.name}</h1>
              <h1>태그: {profileStore.userOverview.tags}</h1>
              <h1>소개: {profileStore.userOverview.introduce}</h1>
              <h1>소속: {profileStore.userOverview.organizations}</h1>
            </div>
          )}
        </div>
      </Layout>
      <style jsx>
        {`
          .material-symbols-sharp {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
          }
        `}
      </style>
    </>
  );
});

export default UserProfile;
