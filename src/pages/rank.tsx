import { NextPage } from "next";
import { observer } from "mobx-react";
import { Layout } from "@/components/Layout";
import React, { MouseEvent, useEffect, useRef, useState } from "react";
import rankStyles from "@/styles/rank.module.scss";
import { useStores } from "@/stores/context";
import { UserRankingOverview } from "@/models/rank/UserRankingOverview";
import { UserStatus } from "@/models/user/UserStatus";
import Image from "next/image";
import { DEFAULT_THUMBNAIL_URL } from "@/constants/default";
import { PagenationBar } from "@/components/PagenationBar";
import { timeToString } from "@/components/TimeToString";
import { RANK_TYPE, rankType } from "@/models/rank/RankType";
import { MENU_DIV_POSITION } from "@/constants/rank.constant";
import { OrganizationSelectButton } from "@/components/OrganizationSelectButton";
import {
  ProfileDialog,
  ProfileDialogContainer,
} from "@/components/ProfileDialog";

const RankItem: NextPage<{
  item: UserRankingOverview;
  setModal: (id: string) => void;
  isMine: boolean;
}> = observer(({ item, setModal, isMine }) => {
  useEffect(() => {
    let id = item.ranking.toString();
    const rankDiv = document.getElementById(id);
    if (rankDiv) {
      let rank: string;
      switch (item.ranking.toString()) {
        case "1":
          rank = "first";
          break;
        case "2":
          rank = "second";
          break;
        case "3":
          rank = "third";
          break;
        default:
          rank = "etc";
      }
      if (item.rankingScore === 0) rank = "none";
      rankDiv.setAttribute("rank", rank);
      rankDiv.id = "";
    }
  }, [item.ranking, item.studyTime]);

  const scoreToString = (rankingScore: number): string => {
    let score = rankingScore.toString();
    let arr: string[] = [];
    while (score.length > 3) {
      arr.push(score.slice(score.length - 3));
      score = score.slice(0, score.length - 3);
    }
    arr.push(score);
    return arr.reverse().join(",");
  };

  return (
    <>
      <div
        className={`${rankStyles["rank-form__content"]} elevation__card__search-bar__contained-button--waiting__etc`}
        onClick={() => {
          setModal(item.id);
        }}
      >
        <div
          id={item.ranking.toString()}
          className={`${rankStyles["rank-form__content__ranking"]}`}
        >
          <label
            className={`${rankStyles["rank-form__content__ranking__label"]} typography__sub-headline--small`}
          >
            {item.rankingScore === 0 ? "-" : item.ranking}
          </label>
        </div>
        {item.profileImage ? (
          <div className={`${rankStyles["rank-form__content__profile-img"]}`}>
            <Image
              alt={item.id}
              src={item.profileImage}
              objectFit="cover"
              layout="fill"
            ></Image>
          </div>
        ) : (
          <div className={`${rankStyles["rank-form__content__profile-img"]}`}>
            <span className="material-symbols-sharp">person</span>
          </div>
        )}
        <div className={`${rankStyles["rank-form__content__profile"]}`}>
          <div className={`${rankStyles["rank-form__content__info"]}`}>
            <label
              className={`${rankStyles["rank-form__content__nickname"]} typography__text`}
            >
              {item.name}
            </label>
          </div>
          <label
            className={`${rankStyles["rank-form__content__introduce"]} typography__text`}
          >
            {item.introduce}
          </label>
        </div>
        <div className={`${rankStyles["rank-form__content__record"]}`}>
          <div className={`${rankStyles["rank-form__content__score-form"]}`}>
            <label
              className={`${rankStyles["rank-form__content__score"]} typography__sub-headline--small`}
            >
              {item.rankingScore !== 0
                ? scoreToString(item.rankingScore) + " 점"
                : "점수 없음"}
            </label>
          </div>
          <label
            className={`${rankStyles["rank-form__content__study-time"]} typography__sub-headline--small`}
          >
            {item.studyTime ? timeToString(item.studyTime) : "0시간 0분"}
          </label>
        </div>
      </div>
      <style jsx>
        {`
          .material-symbols-sharp {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24;
          }
        `}
      </style>
    </>
  );
});

const RankItemGroup: NextPage<{
  items: UserRankingOverview[];
  setModal: (id: string) => void;
}> = observer(({ items, setModal }) => {
  const { rankStore, userStore } = useStores();
  const [selected, setSelected] = useState<RANK_TYPE>(rankType.TOTAL);
  const [position, setPosition] = useState<number>(MENU_DIV_POSITION.TOTAL);
  const [showRankInfo, setShowRankInfo] = useState(false);

  useEffect(() => {
    if (showRankInfo) {
      document.getElementById("rank-info-dialog")!.style.display = "flex";
    } else {
      document.getElementById("rank-info-dialog")!.style.display = "none";
    }
  }, [showRankInfo]);

  useEffect(() => {
    switch (selected) {
      case rankType.TOTAL:
        setPosition(MENU_DIV_POSITION.TOTAL);
        break;
      case rankType.WEEKLY:
        setPosition(MENU_DIV_POSITION.WEEKLY);
        break;
    }
    rankStore.setIsWeekly(selected === rankType.WEEKLY);
    const div = document.getElementsByClassName(
      `${rankStyles["rank-header__menu__div"]}`
    )[0] as HTMLElement;
    if (div) {
      div.animate({ left: position }, 200);
      setTimeout(() => {
        div.style.left = `${position}px`;
      }, 200);
    }
  }, [selected, position]);

  const menuOnClick = (menu: RANK_TYPE) => {
    if (menu === rankType.WEEKLY) {
      (
        document.getElementsByClassName(
          `${rankStyles["rank-form"]}`
        )[0] as Element
      ).setAttribute("rankType", "weekly");
    } else {
      (
        document.getElementsByClassName(
          `${rankStyles["rank-form"]}`
        )[0] as Element
      ).removeAttribute("rankType");
    }
    setSelected(menu);
    console.log(
      (
        document.getElementsByClassName(
          `${rankStyles["rank-form"]}`
        )[0] as Element
      ).getAttribute("rankType")
    );
  };

  return (
    <>
      <div className={`${rankStyles["rank-page"]} `}>
        <div className={`${rankStyles["rank-header"]}`}>
          <label
            className={`${rankStyles["rank-header__title"]} typography__sub-headline`}
          >
            랭킹 목록
          </label>
          <div className={`${rankStyles["rank-header__menu__div"]}`}></div>
          <button
            id="overall-rank"
            className={`${
              rankStyles[
                `rank-header__menu${
                  selected === rankType.TOTAL ? "--selected" : ""
                }`
              ]
            } typography__text--big`}
            onClick={() => {
              menuOnClick(rankType.TOTAL);
            }}
          >
            <label className={`${rankStyles["rank-header__menu__label"]}`}>
              전체 랭킹
            </label>
          </button>
          <button
            className={`${
              rankStyles[
                `rank-header__menu${
                  selected === rankType.WEEKLY ? "--selected" : ""
                }`
              ]
            } typography__text--big`}
            onClick={() => {
              menuOnClick(rankType.WEEKLY);
            }}
          >
            <label className={`${rankStyles["rank-header__menu__label"]}`}>
              주간 랭킹
            </label>
          </button>
          <div className={`${rankStyles["rank-header__info"]}`}>
            <span
              className={`${rankStyles["rank-header__info__icon"]} material-symbols-sharp`}
              onMouseEnter={() => setShowRankInfo(true)}
              onMouseLeave={() => setShowRankInfo(false)}
            >
              help
            </span>
            <div
              id={"rank-info-dialog"}
              className={`${rankStyles["rank-header__info__dialog"]} elevation__navigation-drawer__modal-side-bottom-sheet__etc typography__text`}
            >
              <label>
                랭킹 점수는 <b>공부시간, </b> <b>연속 공부 날짜, </b>
                <b>차단 기록</b>을 기준으로 계산됩니다.
              </label>
            </div>
          </div>
        </div>
        {selected === rankType.TOTAL && (
          <div style={{ display: "flex", height: "55px" }}>
            <OrganizationSelectButton />
          </div>
        )}
        <div
          className={`${rankStyles["rank-form"]} elevation__card__search-bar__contained-button--waiting__etc`}
        >
          <div className={`${rankStyles["my-rank-form"]}`}>
            <div className={`${rankStyles["my-rank__sub-title-form"]}`}>
              <label
                className={`${rankStyles["my-rank-form__label"]} typography__text--big`}
              >
                내 랭킹
              </label>
              <label
                className={`${rankStyles["my-rank-form__label__score"]} typography__text--big`}
              >
                랭킹 점수
              </label>
              <label
                className={`${rankStyles["my-rank-form__label__time"]} typography__text--big`}
              >
                공부 시간
              </label>
            </div>

            {selected === rankType.WEEKLY && rankStore.myWeekRank ? (
              <RankItem
                item={rankStore.myWeekRank}
                setModal={setModal}
                isMine={true}
              />
            ) : (
              <>
                {rankStore.myTotalRank && (
                  <RankItem
                    item={rankStore.myTotalRank}
                    setModal={setModal}
                    isMine={true}
                  />
                )}
              </>
            )}
          </div>
          <div className={`${rankStyles["rank-form__subtitle"]}`}>
            <label
              className={`${rankStyles["rank-form__subtitle__label"]} typography__text--big`}
            >
              {selected === rankType.TOTAL ? "전체 랭킹" : "주간 랭킹"}
            </label>
          </div>
          {items.map((item) => (
            <RankItem
              item={item}
              key={item.id}
              setModal={setModal}
              isMine={false}
            />
          ))}
        </div>
        <div className={`${rankStyles["rank-page-nation"]}`}>
          {rankStore.rankMaxPage && (
            <PagenationBar
              maxPage={rankStore.rankMaxPage / 50 + 1}
              update={() => rankStore.getRank()}
            />
          )}
        </div>
      </div>

      <style jsx>
        {`
          .material-symbols-sharp {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24;
          }
        `}
      </style>
    </>
  );
});

const UserRanking: NextPage = observer(() => {
  const { rankStore, userStore } = useStores();
  const [modal, setModal] = useState<string>("");
  useEffect(() => {
    if (!userStore.currentUser) return;
    if (!rankStore.isWeeklyRank) {
      rankStore.getUserTotalRank(userStore.currentUser.id);
    } else {
      rankStore.getUserWeeklyRank(userStore.currentUser.id);
    }
    rankStore.getRank();
  }, [userStore.currentUser, rankStore.isWeeklyRank]);

  return (
    <>
      <Layout>
        {rankStore.rankList && (
          <RankItemGroup items={rankStore.rankList} setModal={setModal} />
        )}
      </Layout>
      {modal !== "" && (
        <>
          <ProfileDialogContainer
            onClick={() => {
              setModal("");
            }}
          />
          <ProfileDialog userId={modal} />
        </>
      )}
    </>
  );
});
export default UserRanking;
