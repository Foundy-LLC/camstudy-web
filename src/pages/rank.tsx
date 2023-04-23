import { NextPage } from "next";
import { observer } from "mobx-react";
import { Layout } from "@/components/Layout";
import React from "react";
import rankStyles from "@/styles/rank.module.scss";

const UserRanking: NextPage = observer(() => {
  return (
    <>
      <Layout>
        <div className={`${rankStyles["rank-page"]}`}>
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
            <div className={`${rankStyles["rank-form__subtitle"]}`}>
              <span
                className={`${rankStyles["rank-form__subtitle__icon"]} material-symbols-sharp`}
              >
                insert_chart
              </span>
              <label
                className={`${rankStyles["rank-form__subtitle__label"]} typography__text--big`}
              >
                전체 랭킹
              </label>
            </div>

            <div
              className={`${rankStyles["rank-form__content"]} elevation__card__search-bar__contained-button--waiting__etc`}
            >
              <div
                className={`${rankStyles["rank-form__content__ranking"]}`}
              ></div>
              <div
                className={`${rankStyles["rank-form__content__profile-img"]}`}
              ></div>
              <div className={`${rankStyles["rank-form__content__profile"]}`}>
                <div className={`${rankStyles["rank-form__content__info"]}`}>
                  <label
                    className={`${rankStyles["rank-form__content__nickname"]} typography__text`}
                  >
                    장길산123
                  </label>
                  <label
                    className={`${rankStyles["rank-form__content__status"]} typography__caption`}
                  >
                    접속중
                  </label>
                </div>
                <label
                  className={`${rankStyles["rank-form__content__introduce"]} typography__text`}
                >
                  공시 공부하는 학생입니다.잘 부탁드립니다.
                </label>
              </div>
              <div className={`${rankStyles["rank-form__content__record"]}`}>
                <label
                  className={`${rankStyles["rank-form__content__score"]} typography__sub-headline--small`}
                >
                  847,835 점
                </label>
                <label
                  className={`${rankStyles["rank-form__content__study-time"]} typography__sub-headline--small`}
                >
                  56:38:17
                </label>
              </div>
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
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24;
          }
        `}
      </style>
    </>
  );
});
export default UserRanking;
