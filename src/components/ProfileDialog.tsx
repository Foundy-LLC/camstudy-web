import { NextPage } from "next";
import profileDialogStyles from "@/styles/profileDialog.module.scss";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { User } from "@/models/user/User";
import { useStores } from "@/stores/context";
import Image from "next/image";
import { timeToString } from "@/components/TimeToString";
import { friendStatus } from "@/constants/FriendStatus";

interface ClickableComponentProps {
  onClick: () => void;
}
export const ProfileDialogContainer: NextPage<ClickableComponentProps> = ({
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`${profileDialogStyles["profile-dialog__background"]}`}
    ></div>
  );
};

export const ProfileDialog: NextPage<{ userId: string }> = observer(
  ({ userId }) => {
    const [user, setUser] = useState<User | undefined>(undefined);
    const { userStore, profileStore, cropStore, rankStore, friendStore } =
      useStores();
    useEffect(() => {
      if (!userStore.currentUser) return;
      profileStore.getUserProfile(userId);
      cropStore.getHarvestedCrops(userId);
      cropStore.fetchGrowingCrop(userId);
      rankStore.getUserTotalRank(userId);
      rankStore.getUserWeeklyRank(userId);
    }, [userStore.currentUser]);

    useEffect(() => {
      if (
        profileStore.userOverview &&
        profileStore.userOverview.id === userId
      ) {
        setUser(profileStore.userOverview);
      }
    }, [profileStore.userOverview]);

    return (
      <>
        <div
          className={`${profileDialogStyles["profile-dialog__form"]} elevation__discretion`}
        >
          <div className={`${profileDialogStyles["profile-dialog__top-bar"]}`}>
            <div className={`${profileDialogStyles["profile-dialog__title"]}`}>
              <span
                className={`${profileDialogStyles["profile-dialog__icon"]} material-symbols-sharp`}
              >
                person
              </span>
              <label
                className={`${profileDialogStyles["profile-dialog__title__label"]} typography__text`}
              >
                유저 프로필
              </label>
            </div>

            <div className={`${profileDialogStyles["profile-dialog__icons"]}`}>
              {/*<span*/}
              {/*  className={`${profileDialogStyles["profile-dialog__share-icon"]} material-symbols-sharp`}*/}
              {/*>*/}
              {/*  share*/}
              {/*</span>*/}
              <span
                className={`${profileDialogStyles["profile-dialog__option-icon"]} material-symbols-sharp`}
              >
                more_horiz
              </span>
            </div>
          </div>
          <div
            className={`${profileDialogStyles["profile-dialog__profile__div"]}`}
          >
            <div
              className={`${profileDialogStyles["profile-dialog__profile"]}`}
            >
              {user?.profileImage ? (
                <Image
                  className={`${profileDialogStyles["profile-dialog__profile-image"]}`}
                  src={user?.profileImage}
                  alt={user?.name}
                  priority={true}
                  width={140}
                  height={140}
                />
              ) : (
                <div
                  className={`${profileDialogStyles["profile-dialog__profile-image"]}`}
                >
                  <span className="material-symbols-sharp">person</span>
                </div>
              )}

              <div
                className={`${profileDialogStyles["profile-dialog__labels"]}`}
              >
                <div
                  className={`${profileDialogStyles["profile-dialog__info"]}`}
                >
                  <label
                    className={`${profileDialogStyles["profile-dialog__name"]} typography__sub-headline`}
                  >
                    {user?.name}
                  </label>
                  <div
                    className={`${profileDialogStyles["profile-dialog__organizations"]}`}
                  >
                    {user?.organizations.map((organization, key) => (
                      <label
                        className={`${profileDialogStyles["profile-dialog__organization"]}`}
                        key={key}
                      >
                        {organization}
                      </label>
                    ))}
                  </div>
                </div>
                <label
                  className={`${profileDialogStyles["profile-dialog__introduce"]} typography__text--big`}
                >
                  {user?.introduce}
                </label>
                <div
                  className={`${profileDialogStyles["profile-dialog__tags"]} `}
                >
                  {user?.tags.map((tag, key) => (
                    <div
                      className={`${profileDialogStyles["profile-dialog__tag"]} typography__text--small`}
                      key={key}
                    >
                      <label
                        className={`${profileDialogStyles["profile-dialog__tag__label"]}`}
                      >
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              className={`${profileDialogStyles["profile-dialog__horizon"]}`}
            ></div>
            <div className={`${profileDialogStyles["profile-dialog__etc"]}`}>
              <div className={`${profileDialogStyles["profile-dialog__rank"]}`}>
                <span
                  className={`${profileDialogStyles["profile-dialog__icon"]} material-symbols-sharp`}
                >
                  insert_chart
                </span>
                <label
                  className={`${profileDialogStyles["profile-dialog__rank__subtitle"]} typography__text`}
                >
                  이번주 랭킹
                </label>
                <label
                  className={`${profileDialogStyles["profile-dialog__rank__weekly"]} typography__sub-headline--small`}
                >
                  {rankStore.userWeekRank?.ranking}위
                </label>
                <label
                  className={`${profileDialogStyles["profile-dialog__rank__total"]} typography__text`}
                >
                  전체 랭킹 기준 {rankStore.userTotalRank?.ranking}위
                </label>
              </div>
              <div
                className={`${profileDialogStyles["profile-dialog__history"]}`}
              >
                <span
                  className={`${profileDialogStyles["profile-dialog__icon"]} material-symbols-sharp`}
                >
                  schedule
                </span>
                <label
                  className={`${profileDialogStyles["profile-dialog__history__subtitle"]} typography__text`}
                >
                  주간 공부시간
                </label>
                <label
                  className={`${profileDialogStyles["profile-dialog__history__weekly"]} typography__sub-headline--small`}
                >
                  {rankStore.userWeekRank &&
                    timeToString(rankStore.userWeekRank.studyTime)}
                </label>
                <label
                  className={`${profileDialogStyles["profile-dialog__history__total"]} typography__text`}
                >
                  전체 유저 기준 상위 {rankStore.totalPercentile}%
                </label>
              </div>
              <div className={`${profileDialogStyles["profile-dialog__crop"]}`}>
                <span
                  className={`${profileDialogStyles["profile-dialog__icon"]} material-symbols-sharp`}
                >
                  potted_plant
                </span>
                <label
                  className={`${profileDialogStyles["profile-dialog__crop__subtitle"]} typography__text`}
                >
                  화분
                </label>
                <div
                  className={`${profileDialogStyles["profile-dialog__crop--image"]}`}
                >
                  {cropStore.cropImageSrc && (
                    <Image
                      src={cropStore.cropImageSrc!}
                      alt={cropStore.cropName}
                      width={44}
                      height={44}
                    />
                  )}
                </div>
                <label
                  className={`${profileDialogStyles["profile-dialog__crop--label"]}`}
                >
                  {cropStore.cropName} {cropStore.growingCrop?.level}
                  단계
                </label>
              </div>
              <div
                className={`${profileDialogStyles["profile-dialog__crop-inventory"]}`}
              >
                <span
                  className={`${profileDialogStyles["profile-dialog__icon"]} material-symbols-sharp`}
                >
                  eco
                </span>
                <label
                  className={`${profileDialogStyles["profile-dialog__crop-inventory__subtitle"]} typography__text`}
                >
                  작물 현황
                </label>
                <div
                  className={`${profileDialogStyles["profile-dialog__crop-inventory__image"]}`}
                >
                  {cropStore.harvestedCrops.slice(0, 4).map((crop, key) => (
                    // <Image
                    //   src={CROPS.}
                    //   alt={cropStore.cropName}
                    //   width={44}
                    //   height={44}
                    // />
                    <label key={key}>{crop.type}</label>
                  ))}
                </div>
                <label
                  className={`${profileDialogStyles["profile-dialog__crop-inventory__label"]}`}
                >
                  총 {cropStore.harvestedCrops.length}개
                </label>
              </div>
            </div>
            {userStore.currentUser?.id === user?.id ? (
              <></>
            ) : user?.requestHistory === friendStatus.REQUESTED ? (
              <button
                className={`${profileDialogStyles["profile-dialog__friend-request__button--requested"]}`}
                onClick={() => {
                  if (
                    confirm(
                      `${user?.name}님에게 보낸 요청을 취소하시겠어요?`
                    ) === true
                  ) {
                    friendStore.cancelFriendRequest(userId);
                    setUser({ ...user!, requestHistory: friendStatus.NONE });
                  }
                }}
              >
                <span
                  className={`${profileDialogStyles["profile-dialog__icon"]} material-symbols-sharp`}
                >
                  send
                </span>
                <label
                  className={`${profileDialogStyles["profile-dialog__friend-request__button__label"]} typography__text`}
                >
                  친구 요청 전송됨
                </label>
              </button>
            ) : user?.requestHistory === friendStatus.ACCEPTED ? (
              <button
                className={`${profileDialogStyles["profile-dialog__friend-request__button--accepted"]}`}
                onClick={() => {
                  if (
                    confirm(`${user?.name}님을 친구에서 삭제하시겠어요?`) ===
                    true
                  ) {
                    friendStore.deleteFriend(userId);
                    setUser({ ...user!, requestHistory: friendStatus.NONE });
                  }
                }}
              >
                <span
                  className={`${profileDialogStyles["profile-dialog__icon"]} material-symbols-sharp`}
                >
                  check
                </span>
                <label
                  className={`${profileDialogStyles["profile-dialog__friend-request__button__label"]} typography__text`}
                >
                  이미 친구입니다
                </label>
              </button>
            ) : (
              <button
                className={`${profileDialogStyles["profile-dialog__friend-request__button"]}`}
                onClick={() => {
                  if (profileStore.userOverview) {
                    friendStore.sendFriendRequest(userId);
                    setUser({
                      ...user!,
                      requestHistory: friendStatus.REQUESTED,
                    });
                  }
                }}
              >
                <span
                  className={`${profileDialogStyles["profile-dialog__icon"]} material-symbols-sharp`}
                >
                  person_add
                </span>

                <label
                  className={`${profileDialogStyles["profile-dialog__friend-request__button__label"]} typography__text`}
                >
                  친구 요청 보내기
                </label>
              </button>
            )}
          </div>
        </div>

        <style jsx>
          {`
            .material-symbols-sharp {
              font-variation-settings: "FILL" 1, "wght" 700, "GRAD" 0, "opsz" 48;
            }
          `}
        </style>
      </>
    );
  }
);