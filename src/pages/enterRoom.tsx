import { NextPage } from "next";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import enterRoomStyles from "@/styles/enterRoom.module.scss";
import { FaSlash } from "react-icons/fa";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { TimerSettingDropDown } from "@/components/TimerSettingDropDown";
import { useStores } from "@/stores/context";
import { User } from "@/models/user/User";
import { rankType } from "@/models/rank/RankType";
import { MENU_DIV_POSITION } from "@/constants/rank.constant";
import rankStyles from "@/styles/rank.module.scss";

const EnterRoom: NextPage = observer(() => {
  const { userStore } = useStores();
  const [cameraOn, setCameraOn] = useState<boolean>(true);
  const [headphoneOn, setHeadphoneOn] = useState<boolean>(true);
  const [micOn, setMicOn] = useState<boolean>(true);
  const [showDialog, setShowDialog] = useState<string>("");
  const [user, setUser] = useState<User>();
  const [micTogglePosition, setMicTogglePosition] = useState("");
  const [camTogglePosition, setCamTogglePosition] = useState("");

  useEffect(() => {
    if (cameraOn) {
      const toggle = document.getElementsByClassName(
        `${enterRoomStyles["enter-room__setting-form__camera__toggle-button__circle--on"]}`
      )[0] as HTMLElement;
      console.log(toggle);
      if (toggle) {
        toggle.animate({ left: 0 }, 1000);
        setTimeout(() => {
          toggle.style.left = `${100}px`;
        }, 200);
      }
    }
  }, [cameraOn]);

  useEffect(() => {
    if (!userStore.currentUser) return;
    setUser(userStore.currentUser);
  }, [userStore.currentUser]);

  const handleHover = (event: React.MouseEvent<HTMLSpanElement>) => {
    console.log((event.target as HTMLElement).className);
    const position = (event.target as HTMLElement).getBoundingClientRect();
    const x = position.x - 8;
    const y = position.y - 45;
    document.getElementById("dialog")!.style.top = y.toString() + "px";
    document.getElementById("dialog")!.style.left = x.toString() + "px";
  };

  const password: string | undefined = "1234";
  const tags: string[] = ["스터디", "공시", "자격증"];
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
      <div className={`${enterRoomStyles["enter-room__page"]}`}>
        <div className={`${enterRoomStyles["enter-room__cam-form"]}`}>
          <div className={`${enterRoomStyles["enter-room__user-form"]}`}>
            {user && (
              <div className={`${enterRoomStyles["enter-room__user"]}`}>
                <div
                  className={`${enterRoomStyles["enter-room__user__video"]}`}
                >
                  <label className="typography__sub-headline">
                    카메라가 꺼져있습니다
                  </label>
                </div>
                <div
                  className={`${enterRoomStyles["enter-room__user__option-bar"]}`}
                >
                  <label
                    className={`${enterRoomStyles["enter-room__user__name"]} typography__text`}
                  >
                    {user.name}(나)
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      className={`${enterRoomStyles["enter-room__camera-icon"]} material-symbols-rounded`}
                    >
                      video_camera_front
                    </span>
                    {!cameraOn && (
                      <FaSlash
                        className={`${enterRoomStyles["enter-room__slash-icon"]} material-symbols-rounded`}
                      />
                    )}
                  </div>
                  <span
                    className={`${enterRoomStyles["enter-room__headphones-icon"]} material-symbols-rounded`}
                  >
                    headphones
                  </span>
                  <span
                    className={`${enterRoomStyles["enter-room__mic-icon"]} material-symbols-rounded`}
                  >
                    mic
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className={`${enterRoomStyles["enter-room__button-form"]}`}>
            <div
              id={"dialog"}
              className={`${enterRoomStyles["dialog-form"]} typography__caption`}
              hidden={showDialog === ""}
            >
              {showDialog}
            </div>

            <Image
              alt={"logo"}
              src={logo}
              width={140}
              height={26.78}
              className={`${enterRoomStyles["enter-room__button-form__logo"]}`}
            />
            <div
              className={`${enterRoomStyles["enter-room__button-form__icon-form"]}`}
            >
              {" "}
              <div style={{ position: "relative" }}>
                <span
                  className={`${enterRoomStyles["enter-room__camera-icon"]} material-symbols-rounded`}
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
                    className={`${enterRoomStyles["enter-room__slash-icon"]} material-symbols-rounded`}
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
                    className={`${enterRoomStyles["enter-room__slash-icon"]} material-symbols-rounded`}
                  />
                )}
              </div>
              <div style={{ position: "relative" }}>
                <span
                  className={`${enterRoomStyles["enter-room__mic-icon"]} material-symbols-rounded`}
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
                    className={`${enterRoomStyles["enter-room__slash-icon"]} material-symbols-rounded`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={`${enterRoomStyles["enter-room__enter-form"]}`}>
          <div className={`${enterRoomStyles["enter-room__info-form"]}`}>
            <div
              className={`${enterRoomStyles["enter-room__info-form__subtitle"]}`}
            >
              <span className="material-symbols-outlined">door_open</span>
              <label
                className={`${enterRoomStyles["enter-room__info-form__subtitle__label"]} typography__text--big`}
              >
                룸 입장 설정
              </label>
            </div>
            <div
              className={`${enterRoomStyles["enter-room__info-form__title"]} typography__sub-headline--small`}
            >
              <label>스터디 룸 제목</label>
              {password && (
                <span className="material-symbols-outlined">lock</span>
              )}
            </div>
            <div
              className={`${enterRoomStyles["enter-room__info-form__tags"]} typography__text`}
            >
              {tags.map((tag) => (
                <label
                  className={`${enterRoomStyles["enter-room__info-form__tag"]}`}
                >
                  #{tag}
                </label>
              ))}
            </div>
            <div
              className={`${enterRoomStyles["enter-room__info-form__joiners-form"]}`}
            >
              <div
                className={`${enterRoomStyles["enter-room__info-form__joiner"]}`}
              ></div>
              <div
                className={`${enterRoomStyles["enter-room__info-form__joiner"]}`}
              ></div>
              <div
                className={`${enterRoomStyles["enter-room__info-form__joiner"]}`}
              ></div>
            </div>
            {password && (
              <input
                className={`${enterRoomStyles["enter-room__info-form__input"]} typography__text--small`}
                type={"password"}
                placeholder={"스터디 룸 비밀번호를 입력해주세요"}
              />
            )}
            <div
              className={`${enterRoomStyles["enter-room__info-form__hr"]}`}
            ></div>
            <div className={`${enterRoomStyles["enter-room__setting-form"]}`}>
              <div
                className={`${enterRoomStyles["enter-room__setting-form__camera"]}`}
              >
                <div
                  className={`${enterRoomStyles["enter-room__setting-form__camera__label"]}`}
                >
                  <label
                    className={`${enterRoomStyles["enter-room__setting-form__camera__label__title"]} typography__text`}
                  >
                    내 캠 켜기
                  </label>
                  <label
                    className={`${enterRoomStyles["enter-room__setting-form__camera__label__sub-title"]} typography__caption`}
                  >
                    다른 사용자들에게 내 캠 화면이 보이게 설정합니다
                  </label>
                </div>
                <div
                  className={`${
                    enterRoomStyles[
                      `enter-room__setting-form__camera__toggle-button${
                        cameraOn ? "--on" : ""
                      }`
                    ]
                  }`}
                  onClick={() => {
                    setCameraOn(!cameraOn);
                  }}
                >
                  <div
                    id={"cameraToggle"}
                    className={`${
                      enterRoomStyles[
                        `enter-room__setting-form__camera__toggle-button${
                          cameraOn ? "--on" : ""
                        }__circle`
                      ]
                    }`}
                  ></div>
                </div>
              </div>
              <div
                className={`${enterRoomStyles["enter-room__setting-form__mic"]}`}
              >
                <div
                  className={`${enterRoomStyles["enter-room__setting-form__mic__label"]}`}
                >
                  <label
                    className={`${enterRoomStyles["enter-room__setting-form__mic__label__title"]} typography__text`}
                  >
                    내 마이크 켜기
                  </label>
                  <label
                    className={`${enterRoomStyles["enter-room__setting-form__mic__label__sub-title"]} typography__caption`}
                  >
                    다른 사용자들에게 내 음성이 들리게 설정합니다
                  </label>
                </div>
                <div
                  className={`${
                    enterRoomStyles[
                      `enter-room__setting-form__mic__toggle-button${
                        micOn ? "--on" : ""
                      }`
                    ]
                  }`}
                  onClick={() => {
                    setMicOn(!micOn);
                  }}
                >
                  <div
                    id={"micToggle"}
                    className={`${
                      enterRoomStyles[
                        `enter-room__setting-form__mic__toggle-button${
                          micOn ? "--on" : ""
                        }__circle`
                      ]
                    }`}
                  ></div>
                </div>
              </div>
              <button
                className={`${enterRoomStyles["enter-room__setting-form__enter-button"]} typography__text`}
              >
                <label>스터디 룸 입장하기</label>
              </button>
            </div>
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
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
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
export default EnterRoom;
