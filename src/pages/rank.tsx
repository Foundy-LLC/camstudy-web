import { NextPage } from "next";
import { observer } from "mobx-react";
import { Layout } from "@/components/Layout";
import React from "react";
import rankStyles from "@/styles/rank.module.scss";

const UserRanking: NextPage = observer(() => {
  return (
    <>
      <Layout>
        <div>
          <div className={`${rankStyles["rank-header"]}`}>
            <label
              className={`${rankStyles["rank-header__title"]} typography__sub-headline`}
            >
              랭킹 목록
            </label>
            <button
              className={`${rankStyles["rank-header__menu"]} typography__text--big`}
            >
              <label>전체 랭킹</label>
            </button>
            <button
              className={`${rankStyles["rank-header__menu"]} typography__text--big`}
            >
              <label>주간 랭킹</label>
            </button>
            <button
              className={`${rankStyles["rank-header__menu"]} typography__text--big`}
            >
              <label>소속 랭킹</label>
            </button>
            <span
              className={`${rankStyles["rank-header__info"]} material-symbols-sharp`}
            >
              help
            </span>
          </div>
          <div className={`${rankStyles["rank-form"]}`}>
            <span
              className={`${rankStyles["rank-header__menu"]} material-symbols-sharp`}
            >
              insert_chart
            </span>
            <label className={`${rankStyles["rank-form__subtitle"]}`}>
              전체 랭킹
            </label>
            <div className={`${rankStyles["rank-form__content"]}`}>
              <div
                className={`${rankStyles["rank-form__content__ranking"]}`}
              ></div>
              <div
                className={`${rankStyles["rank-form__content__profile-img"]}`}
              ></div>
              <div
                className={`${rankStyles["rank-form__content__profile"]}`}
              ></div>
              <label
                className={`${rankStyles["rank-form__content__score"]}`}
              ></label>
              <label
                className={`${rankStyles["rank-form__content__study-time"]}`}
              ></label>
              <span
                className={`${rankStyles["rank-form__content__add-friend"]} material-symbols-sharp`}
              >
                person_add
              </span>
              <span
                className={`${rankStyles["rank-form__content__option"]} material-symbols-sharp`}
              >
                more_horiz
              </span>
            </div>
          </div>
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
export default UserRanking;
