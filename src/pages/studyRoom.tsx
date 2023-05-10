import { NextPage } from "next";
import { observer } from "mobx-react";
import studyRoomStyles from "@/styles/studyRoom.module.scss";
import React from "react";
import Image from "next/image";
import logo from "@/assets/logo.png";
const StudyRoom: NextPage = observer(() => {
  return (
    <>
      <div className={`${studyRoomStyles["study-room__page"]}`}>
        <div className={`${studyRoomStyles["study-room__cam-form"]}`}>
          <div className={`${studyRoomStyles["study-room__user-form"]}`}>
            <div
              className={`${studyRoomStyles["study-room__user-form__grid"]}`}
            >
              <div className={`${studyRoomStyles["study-room__user"]}`}>
                <div
                  className={`${studyRoomStyles["study-room__user__video"]}`}
                >
                  <label className="typography__sub-headline">
                    카메라가 꺼져있습니다
                  </label>
                </div>
                <div
                  className={`${studyRoomStyles["study-room__user__option-bar"]}`}
                >
                  <label
                    className={`${studyRoomStyles["study-room__user__name"]} typography__text`}
                  >
                    홍길동
                  </label>
                  <span
                    className={`${studyRoomStyles["study-room__camera-icon"]} material-symbols-rounded`}
                  >
                    video_camera_front
                  </span>
                  <span
                    className={`${studyRoomStyles["study-room__headphones-icon"]} material-symbols-rounded`}
                  >
                    headphones
                  </span>
                  <span
                    className={`${studyRoomStyles["study-room__mic-icon"]} material-symbols-rounded`}
                  >
                    mic
                  </span>
                  <span
                    className={`${studyRoomStyles["study-room__option-icon"]} material-symbols-rounded`}
                  >
                    more_horiz
                  </span>
                </div>
              </div>
              <div className={`${studyRoomStyles["study-room__user"]}`}>
                <div
                  className={`${studyRoomStyles["study-room__user__video"]}`}
                >
                  <label className="typography__sub-headline">
                    카메라가 꺼져있습니다
                  </label>
                </div>
                <div
                  className={`${studyRoomStyles["study-room__user__option-bar"]}`}
                >
                  <label
                    className={`${studyRoomStyles["study-room__user__name"]} typography__text`}
                  >
                    홍길동
                  </label>
                  <span
                    className={`${studyRoomStyles["study-room__camera-icon"]} material-symbols-rounded`}
                  >
                    video_camera_front
                  </span>
                  <span
                    className={`${studyRoomStyles["study-room__headphones-icon"]} material-symbols-rounded`}
                  >
                    headphones
                  </span>
                  <span
                    className={`${studyRoomStyles["study-room__mic-icon"]} material-symbols-rounded`}
                  >
                    mic
                  </span>
                  <span
                    className={`${studyRoomStyles["study-room__option-icon"]} material-symbols-rounded`}
                  >
                    more_horiz
                  </span>
                </div>
              </div>
              <div className={`${studyRoomStyles["study-room__user"]}`}>
                <div
                  className={`${studyRoomStyles["study-room__user__video"]}`}
                >
                  <label className="typography__sub-headline">
                    카메라가 꺼져있습니다
                  </label>
                </div>
                <div
                  className={`${studyRoomStyles["study-room__user__option-bar"]}`}
                >
                  <label
                    className={`${studyRoomStyles["study-room__user__name"]} typography__text`}
                  >
                    홍길동
                  </label>
                  <span
                    className={`${studyRoomStyles["study-room__camera-icon"]} material-symbols-rounded`}
                  >
                    video_camera_front
                  </span>
                  <span
                    className={`${studyRoomStyles["study-room__headphones-icon"]} material-symbols-rounded`}
                  >
                    headphones
                  </span>
                  <span
                    className={`${studyRoomStyles["study-room__mic-icon"]} material-symbols-rounded`}
                  >
                    mic
                  </span>
                  <span
                    className={`${studyRoomStyles["study-room__option-icon"]} material-symbols-rounded`}
                  >
                    more_horiz
                  </span>
                </div>
              </div>
              <div className={`${studyRoomStyles["study-room__user"]}`}>
                <div
                  className={`${studyRoomStyles["study-room__user__video"]}`}
                >
                  <label className="typography__sub-headline">
                    카메라가 꺼져있습니다
                  </label>
                </div>
                <div
                  className={`${studyRoomStyles["study-room__user__option-bar"]}`}
                >
                  <label
                    className={`${studyRoomStyles["study-room__user__name"]} typography__text`}
                  >
                    홍길동
                  </label>
                  <span
                    className={`${studyRoomStyles["study-room__camera-icon"]} material-symbols-rounded`}
                  >
                    video_camera_front
                  </span>
                  <span
                    className={`${studyRoomStyles["study-room__headphones-icon"]} material-symbols-rounded`}
                  >
                    headphones
                  </span>
                  <span
                    className={`${studyRoomStyles["study-room__mic-icon"]} material-symbols-rounded`}
                  >
                    mic
                  </span>
                  <span
                    className={`${studyRoomStyles["study-room__option-icon"]} material-symbols-rounded`}
                  >
                    more_horiz
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className={`${studyRoomStyles["study-room__button-form"]}`}>
            <Image
              alt={"logo"}
              src={logo}
              width={140}
              height={26.78}
              className={`${studyRoomStyles["study-room__button-form__logo"]}`}
            />
            <div
              className={`${studyRoomStyles["study-room__button-form__icon-form"]}`}
            >
              {" "}
              <span
                className={`${studyRoomStyles["study-room__camera-icon"]} material-symbols-rounded`}
              >
                video_camera_front
              </span>
              <span
                className={`${studyRoomStyles["study-room__headphones-icon"]} material-symbols-rounded`}
              >
                headphones
              </span>
              <span
                className={`${studyRoomStyles["study-room__mic-icon"]} material-symbols-rounded`}
              >
                mic
              </span>
            </div>
          </div>
        </div>
        <div className={`${studyRoomStyles["study-room__info-form"]}`}>
          <div className={`${studyRoomStyles["study-room__timer-form"]}`}>
            <div
              className={`${studyRoomStyles["study-room__timer-form__subtitle"]}`}
            >
              <span className="material-symbols-outlined">timer</span>
              <label
                className={`${studyRoomStyles["study-room__timer-form__subtitle__label"]} typography__text--big`}
              >
                뽀모도로 타이머
              </label>
            </div>
            <div
              className={`${studyRoomStyles["study-room__timer-form__time"]}`}
            >
              <label className="typography__display">24:37</label>
            </div>
            <div
              className={`${studyRoomStyles["study-room__timer-form__time-set"]}`}
            >
              <label className="typography__text">뽀모도로 시간</label>
            </div>
            <div
              className={`${studyRoomStyles["study-room__timer-form__short-rest-set"]}`}
            >
              <label className="typography__text">짧은 휴식 시간</label>
            </div>
            <div
              className={`${studyRoomStyles["study-room__timer-form__long-rest-set"]}`}
            >
              <label className="typography__text">긴 휴식 시간</label>
            </div>
            <div
              className={`${studyRoomStyles["study-room__timer-form__info"]}`}
            >
              <div
                className={`${studyRoomStyles["study-room__timer-form__info__text"]}`}
              >
                <label
                  className={`${studyRoomStyles["study-room__timer-form__info__status"]} typography__text`}
                >
                  뽀모도로 진행중
                </label>
                <label
                  className={`${studyRoomStyles["study-room__timer-form__info__time-info"]} typography__caption`}
                >
                  25분 집중, 5분 휴식을 4번 반복 후 30분간 쉽니다
                </label>
              </div>
              <button
                className={`${studyRoomStyles["study-room__timer-form__info__button"]}`}
              >
                <label className="typography__text">타이머 시작됨</label>
              </button>
            </div>
          </div>
          <div className={`${studyRoomStyles["study-room__chat-form"]}`}>
            <div
              className={`${studyRoomStyles["study-room__chat-form__header"]}`}
            >
              <span className="material-symbols-outlined">chat</span>
              <label
                className={`${studyRoomStyles["study-room__chat-form__header__subtitle"]} typography__text--big`}
              >
                채팅
              </label>
              <label
                className={`${studyRoomStyles["study-room__chat-form__header__block-list--closed"]} typography__text`}
              >
                <label>차단 목록 열기</label>
                <span className="material-symbols-rounded">expand_less</span>
              </label>
            </div>
            <div
              className={`${studyRoomStyles["study-room__chat-form__text-field"]} typography__text--small`}
            >
              <label
                className={`${studyRoomStyles["study-room__chat-form__text-field__notice"]}`}
              >
                홍길동님이 스터디 룸을 개설했습니다.
              </label>
              <label
                className={`${studyRoomStyles["study-room__chat-form__text-field__notice"]}`}
              >
                강선우님이 스터디 룸을 개설했습니다.
              </label>
              <label
                className={`${studyRoomStyles["study-room__chat-form__text-field__notice"]}`}
              >
                박미정님이 스터디 룸을 개설했습니다.
              </label>
              <label
                className={`${studyRoomStyles["study-room__chat-form__text-field__notice"]}`}
              >
                임꺽정님이 스터디 룸을 개설했습니다.
              </label>
              <div
                className={`${studyRoomStyles["study-room__chat-form__text-field__chat"]} typography__text--small`}
              >
                <label
                  className={`${studyRoomStyles["study-room__chat-form__text-field__name"]}`}
                >
                  홍길동
                </label>
                <label
                  className={`${studyRoomStyles["study-room__chat-form__text-field__text"]}`}
                >
                  다들 반갑습니다~
                </label>
              </div>
            </div>
            <input
              type={"text"}
              placeholder={"채팅 내용을 입력해주세요"}
              className={`${studyRoomStyles["study-room__chat-form__input"]} typography__text--small`}
            />
          </div>
        </div>
      </div>
      <style jsx>
        {`
          .material-symbols-rounded {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
            color: #ffffff;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            cursor: default;
          }
          .material-symbols-outlined {
            font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48;
            color: #ffffff;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            cursor: default;
          }
        `}
      </style>
    </>
  );
});

export default StudyRoom;
