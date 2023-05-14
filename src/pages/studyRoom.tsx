import { NextPage } from "next";
import { observer } from "mobx-react";
import studyRoomStyles from "@/styles/studyRoom.module.scss";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { TimerSettingDropDown } from "@/components/TimerSettingDropDown";
import { FaSlash } from "react-icons/fa";

const StudyRoom: NextPage = observer(() => {
  const [cameraOn, setCameraOn] = useState<boolean>(true);
  const [headphoneOn, setHeadphoneOn] = useState<boolean>(true);
  const [micOn, setMicOn] = useState<boolean>(true);
  const [timerStart, setTimerStart] = useState<boolean>(false);
  const [banListOpen, setBanListOpen] = useState<boolean>(true);
  const [showDialog, setShowDialog] = useState<string>("");
  const [showUserOption, setShowUserOption] = useState<string>("");
  const handleHover = (event: React.MouseEvent<HTMLSpanElement>) => {
    console.log((event.target as HTMLElement).className);
    const position = (event.target as HTMLElement).getBoundingClientRect();
    const x = position.x - 8;
    const y = position.y - 45;
    document.getElementById("dialog")!.style.top = y.toString() + "px";
    document.getElementById("dialog")!.style.left = x.toString() + "px";
  };

  const timerArray: string[] = [
    "20분",
    "25분",
    "30분",
    "35분",
    "40분",
    "45분",
    "50분",
  ];
  const shortRestArray: string[] = [
    "3분",
    "4분",
    "5분",
    "6분",
    "7분",
    "8분",
    "9분",
    "10분",
  ];
  const longRestArray: string[] = ["10분", "15분", "20분", "25분", "30분"];
  const joinedUserNames: string[] = ["홍길동", "강선우", "장길산123", "김철수"];
  const bannedUserNames: string[] = ["김철수123", "김철수123", "김철수123"];
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#6f6f6f",
        position: "relative",
      }}
    >
      <div className={`${studyRoomStyles["study-room__page"]}`}>
        <div className={`${studyRoomStyles["study-room__cam-form"]}`}>
          <div className={`${studyRoomStyles["study-room__user-form"]}`}>
            <div
              className={`${studyRoomStyles["study-room__user-form__grid"]}`}
            >
              {joinedUserNames.map((user, key) => (
                <div
                  key={key}
                  className={`${studyRoomStyles["study-room__user"]}`}
                >
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
                      {user}
                    </label>
                    <div style={{ position: "relative" }}>
                      <span
                        className={`${studyRoomStyles["study-room__camera-icon"]} material-symbols-rounded`}
                      >
                        video_camera_front
                      </span>
                      {!cameraOn && (
                        <FaSlash
                          className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}
                        />
                      )}
                    </div>
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
                    <div
                      tabIndex={0}
                      className={`${studyRoomStyles["study-room__option"]}`}
                      onFocus={() => setShowUserOption(user)}
                      onBlur={() => setShowUserOption("")}
                    >
                      <span
                        className={`${studyRoomStyles["study-room__option-icon"]} material-symbols-rounded`}
                      >
                        more_horiz
                      </span>
                      <ul
                        className={`${studyRoomStyles["study-room__option__dialog"]} typography__text--small`}
                        hidden={showUserOption !== user}
                      >
                        <li>
                          <span className="material-symbols-rounded">
                            block
                          </span>
                          차단하기
                        </li>
                        <li>
                          <span className="material-symbols-rounded">
                            account_circle_off
                          </span>
                          강퇴하기
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={`${studyRoomStyles["study-room__button-form"]}`}>
            <div
              id={"dialog"}
              className={`${studyRoomStyles["dialog-form"]} typography__caption`}
              hidden={showDialog === ""}
            >
              {showDialog}
            </div>

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
              <div style={{ position: "relative" }}>
                <span
                  className={`${studyRoomStyles["study-room__camera-icon"]} material-symbols-rounded`}
                  onClick={() => {
                    setCameraOn(!cameraOn);
                    cameraOn
                      ? setShowDialog("카메라 켜기")
                      : setShowDialog("카메라 끄기");
                  }}
                  onMouseEnter={(e) => {
                    handleHover(e);
                    cameraOn
                      ? setShowDialog("카메라 끄기")
                      : setShowDialog("카메라 켜기");
                  }}
                  onMouseLeave={() => setShowDialog("")}
                >
                  video_camera_front
                </span>
                {!cameraOn && (
                  <FaSlash
                    className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}
                  />
                )}
              </div>
              <div style={{ position: "relative" }}>
                <span
                  className="material-symbols-rounded"
                  onClick={() => {
                    setHeadphoneOn(!headphoneOn);
                    headphoneOn
                      ? setShowDialog("헤드폰 켜기")
                      : setShowDialog("헤드폰 끄기");
                  }}
                  onMouseEnter={(e) => {
                    handleHover(e);
                    headphoneOn
                      ? setShowDialog("헤드폰 끄기")
                      : setShowDialog("헤드폰 켜기");
                  }}
                  onMouseLeave={() => setShowDialog("")}
                >
                  headphones
                </span>
                {!headphoneOn && (
                  <FaSlash
                    className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}
                  />
                )}
              </div>
              <div style={{ position: "relative" }}>
                <span
                  className={`${studyRoomStyles["study-room__mic-icon"]} material-symbols-rounded`}
                  onClick={() => {
                    setMicOn(!micOn);
                    micOn
                      ? setShowDialog("마이크 켜기")
                      : setShowDialog("마이크 끄기");
                  }}
                  onMouseEnter={(e) => {
                    handleHover(e);
                    micOn
                      ? setShowDialog("마이크 끄기")
                      : setShowDialog("마이크 켜기");
                  }}
                  onMouseLeave={() => setShowDialog("")}
                >
                  mic
                </span>
                {!micOn && (
                  <FaSlash
                    className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}
                  />
                )}
              </div>
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
              <TimerSettingDropDown items={timerArray} initIndex={1} />
            </div>
            <div
              className={`${studyRoomStyles["study-room__timer-form__short-rest-set"]}`}
            >
              <label className="typography__text">짧은 휴식 시간</label>
              <TimerSettingDropDown items={shortRestArray} initIndex={1} />
            </div>
            <div
              className={`${studyRoomStyles["study-room__timer-form__long-rest-set"]}`}
            >
              <label className="typography__text">긴 휴식 시간</label>
              <TimerSettingDropDown items={longRestArray} initIndex={1} />
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
              {timerStart ? (
                <button
                  className={`${studyRoomStyles["study-room__timer-form__info__button--start"]}`}
                  onClick={() => setTimerStart(!timerStart)}
                >
                  <label className="typography__text">타이머 시작됨</label>
                </button>
              ) : (
                <button
                  className={`${studyRoomStyles["study-room__timer-form__info__button"]}`}
                  onClick={() => setTimerStart(!timerStart)}
                >
                  <label className="typography__text">타이머 시작</label>
                </button>
              )}
            </div>
          </div>
          <div className={`${studyRoomStyles["study-room__chat-form"]}`}>
            <div
              className={`${studyRoomStyles["study-room__chat-form__header-form"]}`}
            >
              <div
                className={`${studyRoomStyles["study-room__chat-form__header"]}`}
              >
                <span
                  className={`${studyRoomStyles["study-room__chat-form__header__icon"]} material-symbols-outlined`}
                >
                  chat
                </span>

                <label
                  className={`${studyRoomStyles["study-room__chat-form__header__subtitle"]} typography__text--big`}
                >
                  채팅
                </label>
                <div
                  className={`${studyRoomStyles["study-room__chat-form__header__ban-list__button"]} typography__text`}
                  onClick={() => setBanListOpen(!banListOpen)}
                >
                  {banListOpen ? (
                    <>
                      <label>차단 목록 열기</label>
                      <span className="material-symbols-rounded">
                        expand_more
                      </span>
                    </>
                  ) : (
                    <>
                      <label>차단 목록 닫기</label>
                      <span className="material-symbols-rounded">
                        expand_less
                      </span>
                    </>
                  )}
                </div>

                {!banListOpen && (
                  <>
                    <div
                      className={`${studyRoomStyles["study-room__chat-form__ban-list"]}`}
                    >
                      {bannedUserNames.map((user, key) => (
                        <div
                          key={key}
                          className={`${studyRoomStyles["study-room__chat-form__ban-user"]}`}
                        >
                          <div
                            className={`${studyRoomStyles["study-room__chat-form__ban-user__image"]}`}
                          ></div>
                          <label
                            className={`${studyRoomStyles["study-room__chat-form__ban-user__name"]} typography__text`}
                          >
                            김철수123
                          </label>
                          <label
                            className={`${studyRoomStyles["study-room__chat-form__ban-user__ban-cancel"]} typography__text`}
                          >
                            차단 해제하기
                          </label>
                        </div>
                      ))}
                      <div
                        className={`${studyRoomStyles["study-room__chat-form__ban-list__hr"]}`}
                      ></div>
                    </div>
                  </>
                )}
              </div>
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
    </div>
  );
});

export default StudyRoom;
