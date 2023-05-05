import { NextPage } from "next";
import { observer } from "mobx-react";
import { Layout } from "@/components/Layout";
import React, { useEffect, useState } from "react";
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

const RankItem: NextPage<{ item: UserRankingOverview }> = observer(
  ({ item }) => {
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
        rankDiv.setAttribute("rank", rank);
        rankDiv.id = "";
      }
    }, [item.ranking]);

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
        >
          <div
            id={item.ranking.toString()}
            className={`${rankStyles["rank-form__content__ranking"]}`}
          >
            <label
              className={`${rankStyles["rank-form__content__ranking__label"]} typography__sub-headline--small`}
            >
              {item.ranking}
            </label>
          </div>
          <Image
            alt={item.id}
            src={item.profileImage ? item.profileImage : DEFAULT_THUMBNAIL_URL}
            width={40}
            height={40}
            className={`${rankStyles["rank-form__content__profile-img"]}`}
          ></Image>
          <div className={`${rankStyles["rank-form__content__profile"]}`}>
            <div className={`${rankStyles["rank-form__content__info"]}`}>
              <label
                className={`${rankStyles["rank-form__content__nickname"]} typography__text`}
              >
                {item.name}
              </label>
              <label
                className={`${rankStyles["rank-form__content__status"]} typography__caption`}
              >
                {item.status === UserStatus.LOGIN ? "접속중" : "오프라인"}
              </label>
            </div>
            <label
              className={`${rankStyles["rank-form__content__introduce"]} typography__text`}
            >
              {item.introduce}
            </label>
          </div>
          <div className={`${rankStyles["rank-form__content__record"]}`}>
            <label
              className={`${rankStyles["rank-form__content__score"]} typography__sub-headline--small`}
            >
              {scoreToString(item.rankingScore)} 점
            </label>
            <label
              className={`${rankStyles["rank-form__content__study-time"]} typography__sub-headline--small`}
            >
              {timeToString(item.studyTime)}
            </label>
          </div>

          <span
            className={`${rankStyles["rank-form__content__option"]} material-symbols-sharp`}
          >
            more_horiz
          </span>
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
  }
);

const RankItemGroup: NextPage<{ items: UserRankingOverview[] }> = observer(
  ({ items }) => {
    const { rankStore } = useStores();
    const [selected, setSelected] = useState<RANK_TYPE>(rankType.TOTAL);
    const [position, setPosition] = useState<number>(MENU_DIV_POSITION.TOTAL);

    useEffect(() => {
      switch (selected) {
        case rankType.TOTAL:
          setPosition(MENU_DIV_POSITION.TOTAL);
          break;
        case rankType.WEEKLY:
          setPosition(MENU_DIV_POSITION.WEEKLY);
          break;
        case rankType.ORGANIZATIONS:
          setPosition(MENU_DIV_POSITION.ORGANIZATIONS);
          break;
      }

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
      setSelected(menu);
    };

    return (
      <>
        <div className={`${rankStyles["rank-page"]}`}>
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
              onClick={async () => {
                await menuOnClick(rankType.WEEKLY);
              }}
            >
              <label className={`${rankStyles["rank-header__menu__label"]}`}>
                주간 랭킹
              </label>
            </button>
            <button
              className={`${
                rankStyles[
                  `rank-header__menu${
                    selected === rankType.ORGANIZATIONS ? "--selected" : ""
                  }`
                ]
              } typography__text--big`}
              onClick={async () => {
                await menuOnClick(rankType.ORGANIZATIONS);
              }}
            >
              <label className={`${rankStyles["rank-header__menu__label"]}`}>
                소속 랭킹
              </label>
            </button>
            <span
              className={`${rankStyles["rank-header__info"]} material-symbols-sharp`}
            >
              help
            </span>
          </div>
          <div className={`${rankStyles["rank-form"]}`}>
            <div className={`${rankStyles["rank-form__subtitle"]}`}>
              <span
                className={`${rankStyles["rank-form__subtitle__icon"]} material-symbols-sharp`}
              >
                insert_chart
              </span>
              <label
                className={`${rankStyles["rank-form__subtitle__label"]} typography__text--big`}
              >
                {selected === rankType.TOTAL
                  ? "전체 랭킹"
                  : selected === rankType.WEEKLY
                  ? "주간 랭킹"
                  : "소속 랭킹"}
              </label>
            </div>
            <div className={`${rankStyles["my-rank-form"]}`}>
              <RankItem item={rankStore.userTotalRank!} />
            </div>
            {items.map((item) => (
              <RankItem item={item} key={item.id} />
            ))}
            <div className={`${rankStyles["rank-page-nation"]}`}>
              {rankStore.rankMaxPage && (
                <PagenationBar
                  maxPage={rankStore.rankMaxPage / 50 + 1}
                  update={() => rankStore.getRank()}
                />
              )}
            </div>
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
  }
);

const UserRanking: NextPage = observer(() => {
  const { rankStore, userStore } = useStores();

  useEffect(() => {
    if (!userStore.currentUser) return;
    rankStore.getUserTotalRank(userStore.currentUser.id);
    rankStore.getRank();
  }, [userStore.currentUser]);

  return (
    <>
      <Layout>
        {rankStore.rankList && <RankItemGroup items={rankStore.rankList} />}
      </Layout>
    </>
  );
});
export default UserRanking;
