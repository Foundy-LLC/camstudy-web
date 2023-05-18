import { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { RoomStore } from "@/stores/RoomStore";
import { useRouter } from "next/router";
import { ChatMessage } from "@/models/room/ChatMessage";
import { PomodoroTimerState } from "@/models/room/PomodoroTimerState";
import { TimerEditInputGroup } from "@/components/TimerEditInputGroup";
import { RoomState } from "@/models/room/RoomState";
import { UserProfileImage } from "@/components/UserProfileImage";
import { PeerState } from "@/models/room/PeerState";
import PopupMenu from "@/components/PopupMenu";
import { getEnumKeyByEnumValue } from "@/utils/EnumUtil";
import Button from "@mui/material/Button";
import { RoomSettingDialog } from "@/components/RoomSettingDialog";
import { useStores } from "@/stores/context";
import WaitingRoom from "@/components/waitingRoom";
import studyRoomStyles from "@/styles/studyRoom.module.scss";
import { FaSlash } from "react-icons/fa";
import logo from "@/assets/logo.png";
import Image from "next/image";
import { TimerSettingDropDown } from "@/components/TimerSettingDropDown";

enum MasterPopupMenus {
  Kick = "강퇴",
  Block = "차단",
}

const RoomScaffold: NextPage = observer(() => {
  const { userStore } = useStores();
  const { roomListStore } = useStores();
  const [roomStore] = useState(() => new RoomStore(userStore));
  const router = useRouter();
  const roomId = router.query.roomId;

  useEffect(() => {
    console.log(roomId);
    if (typeof roomId === "string") {
      roomStore.connectSocket(roomId);
    }
  }, [roomStore, roomId]);

  if (roomStore.failedToSignIn) {
    router.replace("/login");
    return <></>;
  }

  switch (roomStore.state) {
    case RoomState.NOT_EXISTS:
      return <NotExistsPage />;
    case RoomState.CREATED:
    case RoomState.CONNECTED:
    case RoomState.WAITING_ROOM:
      return <WaitingRoom roomStore={roomStore} />;
    case RoomState.JOINED:
      return <StudyRoom roomStore={roomStore} />;
  }
});

const NotExistsPage: NextPage = () => {
  const router = useRouter();
  return (
    <>
      존재하지 않는 방입니다.
      <Button onClick={() => router.replace("/")}>홈으로</Button>
    </>
  );
};

const WaitingRoom1: NextPage<{
  roomStore: RoomStore;
}> = observer(({ roomStore }) => {
  return (
    <>
      <Video
        id="localVideo"
        videoStream={roomStore.localVideoStream}
        roomStore={roomStore}
      />
      <button
        id="videoToggle"
        onClick={() =>
          roomStore.enabledLocalVideo
            ? roomStore.hideVideo()
            : roomStore.showVideo()
        }
      >
        {roomStore.enabledLocalVideo ? "Hide Video" : "Show Video"}
      </button>
      <button
        id="audioToggle"
        onClick={() =>
          roomStore.enabledLocalAudio
            ? roomStore.muteMicrophone()
            : roomStore.unmuteMicrophone()
        }
      >
        {roomStore.enabledLocalAudio ? "Mute Audio" : "Unmute Audio"}
      </button>
      <button
        id="headphoneToggle"
        onClick={() =>
          roomStore.enabledHeadset
            ? roomStore.muteHeadset()
            : roomStore.unmuteHeadset()
        }
      >
        {roomStore.enabledHeadset ? "Mute Headset" : "Unmute Headset"}
      </button>
      <div style={{ padding: "16px" }}>
        {roomStore.hasPassword ? (
          <input
            type="password"
            placeholder="비밀번호 입력..."
            value={roomStore.passwordInput}
            onChange={(e) => roomStore.updatePasswordInput(e.target.value)}
          />
        ) : undefined}
        <button
          disabled={!roomStore.enableJoinButton}
          onClick={() => roomStore.joinRoom()}
        >
          입장
        </button>
      </div>
      <div>{roomStore.waitingRoomMessage}</div>

      <div>
        <div>방 참여자 목록</div>
        {roomStore.roomJoiners.map((joiner) => {
          return (
            <div key={joiner.id} style={{ padding: "8px" }}>
              <UserProfileImage userId={joiner.id} />
              {joiner.name}
            </div>
          );
        })}
      </div>
    </>
  );
});

const StudyRoom: NextPage<{ roomStore: RoomStore }> = observer(
  ({ roomStore }) => {
    const enabledVideo = roomStore.enabledLocalVideo;
    const enabledAudio = roomStore.enabledLocalAudio;
    const enabledHeadset = roomStore.enabledHeadset;
    const isCurrentUserMaster = roomStore.isCurrentUserMaster;
    const router = useRouter();
    const [openSettingDialog, setOpenSettingDialog] = React.useState(false);
    const [showDialog, setShowDialog] = useState<string>("");
    const [cameraOn, setCameraOn] = useState<boolean>(true);
    const [headphoneOn, setHeadphoneOn] = useState<boolean>(true);
    const [micOn, setMicOn] = useState<boolean>(true);
    const [timerStart, setTimerStart] = useState<boolean>(false);
    const [banListOpen, setBanListOpen] = useState<boolean>(true);

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
    const bannedUserNames: string[] = ["김철수123", "김철수123", "김철수123"];

    useEffect(() => {
      if (roomStore.userMessage != null) {
        alert(roomStore.userMessage);
        roomStore.clearUserMessage();
      }
    }, [roomStore.userMessage]);

    useEffect(() => {
      if (roomStore.kicked) {
        alert("방장에 의해 강퇴되었습니다.");
        router.replace("/");
      }
    }, [roomStore.kicked, router]);

    const handleKickButtonClick = (userId: string) => {
      const targetUserName = roomStore.requireUserNameBy(userId);
      const confirmed = confirm(`정말로 ${targetUserName}님을 강퇴할까요?`);
      if (confirmed) {
        roomStore.kickUser(userId);
      }
    };

    const handleBlockButtonClick = (userId: string) => {
      const targetUserName = roomStore.requireUserNameBy(userId);
      const confirmed = confirm(`정말로 ${targetUserName}님을 차단할까요?`);
      if (confirmed) {
        roomStore.blockUser(userId);
      }
    };

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
        <RoomSettingDialog
          open={openSettingDialog}
          onClose={() => setOpenSettingDialog(false)}
          onUpdatedTimer={() => {
            /* TODO: 구현 */
          }}
          onUnblockedUser={(user) => roomStore.unblockUser(user.id)}
          blacklist={roomStore.blacklist}
        />
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
                    {enabledVideo ? (
                      <Video
                        id="localVideo"
                        videoStream={roomStore.localVideoStream}
                        roomStore={roomStore}
                      />
                    ) : (
                      <label className="typography__sub-headline">
                        카메라가 꺼져있습니다
                      </label>
                    )}
                  </div>
                  <div
                    className={`${studyRoomStyles["study-room__user__option-bar"]}`}
                  >
                    <label
                      className={`${studyRoomStyles["study-room__user__name"]} typography__text`}
                    >
                      사람
                    </label>
                  </div>
                  <div style={{ position: "relative" }}>
                    <span
                      className={`${studyRoomStyles["study-room__camera-icon"]} material-symbols-rounded`}
                    >
                      video_camera_front
                    </span>
                    {!enabledVideo && (
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

                  {!enabledHeadset ? "헤드셋 꺼짐!" : ""}
                  {!enabledAudio ? "마이크 꺼짐!" : ""}
                </div>
                <RemoteMediaGroup
                  roomStore={roomStore}
                  isCurrentUserMaster={isCurrentUserMaster}
                  peerStates={roomStore.peerStates}
                  remoteVideoStreamByPeerIdEntries={
                    roomStore.remoteVideoStreamByPeerIdEntries
                  }
                  remoteAudioStreamByPeerIdEntries={
                    roomStore.remoteAudioStreamByPeerIdEntries
                  }
                  onKickClick={handleKickButtonClick}
                  onBlockClick={handleBlockButtonClick}
                />
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
                        roomStore.enabledLocalVideo
                          ? roomStore.hideVideo()
                          : roomStore.showVideo();
                        !roomStore.enabledLocalVideo
                          ? setShowDialog("카메라 켜기")
                          : setShowDialog("카메라 끄기");
                      }}
                      onMouseEnter={(e) => {
                        handleHover(e);
                        roomStore.enabledLocalVideo
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
                        roomStore.enabledHeadset
                          ? roomStore.muteHeadset()
                          : roomStore.unmuteHeadset();

                        !roomStore.enabledHeadset
                          ? setShowDialog("헤드폰 켜기")
                          : setShowDialog("헤드폰 끄기");
                      }}
                      onMouseEnter={(e) => {
                        handleHover(e);
                        roomStore.enabledHeadset
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
                        roomStore.enabledLocalAudio
                          ? roomStore.muteMicrophone()
                          : roomStore.unmuteMicrophone();

                        !roomStore.enabledLocalAudio
                          ? setShowDialog("마이크 켜기")
                          : setShowDialog("마이크 끄기");
                      }}
                      onMouseEnter={(e) => {
                        handleHover(e);
                        roomStore.enabledLocalAudio
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

              {/*<div className="chatMessageColumn">*/}
              {/*  <ChatMessage messages={roomStore.chatMessages} />*/}
              {/*  <input*/}
              {/*    value={roomStore.chatInput}*/}
              {/*    onChange={(e) => roomStore.updateChatInput(e.target.value)}*/}
              {/*  />*/}
              {/*  <button*/}
              {/*    disabled={!roomStore.enabledChatSendButton}*/}
              {/*    onClick={() => roomStore.sendChat()}*/}
              {/*  >*/}
              {/*    전송*/}
              {/*  </button>*/}
              {/*</div>*/}
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
        </div>
        {/*<DeviceSelector roomStore={roomStore}></DeviceSelector>*/}
        {/*<div>*/}
        {/*  <PomodoroTimer*/}
        {/*    timerState={roomStore.pomodoroTimerState}*/}
        {/*    getElapsedSeconds={() => roomStore.pomodoroTimerElapsedSeconds}*/}
        {/*    onClickStart={() => roomStore.startTimer()}*/}
        {/*  />*/}
        {/*  /!* TODO: 관리자인 경우만 타이머 편집 부분 보이기*!/*/}
        {/*  {roomStore.pomodoroTimerProperty !== undefined ? (*/}
        {/*    <TimerEditInputGroup*/}
        {/*      defaultTimerProperty={roomStore.pomodoroTimerProperty}*/}
        {/*      onClickSave={roomStore.updateAndStopPomodoroTimer}*/}
        {/*    />*/}
        {/*  ) : undefined}*/}
        {/*</div>*/}
        {/*{isCurrentUserMaster && (*/}
        {/*  <div>*/}
        {/*    <Button onClick={() => setOpenSettingDialog(true)}>설정</Button>*/}
        {/*  </div>*/}
        {/*)}*/}
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
  }
);

const RemoteMediaGroup: NextPage<{
  roomStore: RoomStore;
  isCurrentUserMaster: boolean;
  peerStates: PeerState[];
  remoteVideoStreamByPeerIdEntries: [string, MediaStream][];
  remoteAudioStreamByPeerIdEntries: [string, MediaStream][];
  onKickClick: (userId: string) => void;
  onBlockClick: (userId: string) => void;
}> = observer(
  ({
    roomStore,
    isCurrentUserMaster,
    peerStates,
    remoteVideoStreamByPeerIdEntries,
    remoteAudioStreamByPeerIdEntries,
    onKickClick,
    onBlockClick,
  }) => {
    const masterPopupMenus = Object.values(MasterPopupMenus);

    const handleMasterPopupMenuClick = (item: string, userId: string) => {
      const menuEnum = getEnumKeyByEnumValue(MasterPopupMenus, item);
      switch (menuEnum) {
        case "Kick":
          onKickClick(userId);
          break;
        case "Block":
          onBlockClick(userId);
          break;
      }
    };

    return (
      <>
        {remoteVideoStreamByPeerIdEntries.map((entry) => {
          const [peerId, mediaStream] = entry;
          const peerState = peerStates.find((p) => p.uid === peerId);
          if (peerState === undefined) {
            throw Error("피어 상태가 존재하지 않습니다.");
          }

          return (
            <div className={`${studyRoomStyles["study-room__user"]}`}>
              <div className={`${studyRoomStyles["study-room__user__video"]}`}>
                {mediaStream != null ? (
                  <Video
                    id={peerId}
                    key={peerId}
                    videoStream={mediaStream}
                    roomStore={roomStore}
                  />
                ) : (
                  <label className="typography__sub-headline">
                    카메라가 꺼져있습니다
                  </label>
                )}
              </div>
              <div
                className={`${studyRoomStyles["study-room__user__option-bar"]}`}
              >
                <label
                  className={`${studyRoomStyles["study-room__user__name"]} typography__text`}
                >
                  {peerState.name}
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <span
                  className={`${studyRoomStyles["study-room__camera-icon"]} material-symbols-rounded`}
                >
                  video_camera_front
                </span>
                {mediaStream != null && (
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
              {isCurrentUserMaster && (
                <PopupMenu
                  label={"더보기"}
                  menuItems={masterPopupMenus}
                  onMenuItemClick={(item) =>
                    handleMasterPopupMenuClick(item, peerId)
                  }
                  name={peerState.name}
                />
              )}
            </div>
          );
        })}

        <div>
          {remoteAudioStreamByPeerIdEntries.map((entry) => {
            const [peerId, mediaStream] = entry;
            return <Audio key={peerId} id={peerId} audioStream={mediaStream} />;
          })}
        </div>
      </>
    );
  }
);

const DeviceSelector: NextPage<{ roomStore: RoomStore }> = observer(
  ({ roomStore }) => {
    // 현재 사용 가능한 장치 목록 불러오고 현재 사용 중인 장치 저장
    useEffect(() => {
      (async () => {
        await initDevice();
        const videoLabel = roomStore.localVideoStream?.getTracks()[0].label;
        const audioLabel = roomStore.localAudioStream?.getTracks()[0].label;
        // 트랙에서 가져온 id 값이 실제 장치 id와 다르다. 하지만 label은 똑같기 때문에 label로 id를 찾는다.
        roomStore.setCurrentVideoDeviceId(
          roomStore.videoDeviceList.find((video) => video.label === videoLabel)
            ?.deviceId
        );
        roomStore.setCurrentAudioDeviceId(
          roomStore.audioDeviceList.find((audio) => audio.label === audioLabel)
            ?.deviceId
        );
      })();
    }, []);

    const initDevice = async () => {
      // 모든 장비 목록 불러오기
      const devices = await navigator.mediaDevices.enumerateDevices();
      // 비디오만 분리
      const videoInput = devices.filter(
        (device) => device.kind === "videoinput"
      );
      roomStore.setVideoDeviceList(videoInput);
      // 아래는 위와 동일한데 오디오인 것만 다르다.
      const audioInput = devices.filter(
        (device) => device.kind === "audioinput"
      );
      roomStore.setAudioDeviceList(audioInput);
      // TODO(대현) 스피커 구현
      // const audioOutput = devices.filter(
      //   (device) => device.kind === "audiooutput"
      // );
      // setAudioOutputDeviceList(audioOutput);
    };

    // 장치가 추가되거나 제거되었을 때 발생하는 이벤트
    // 장치 리스트 갱신 -> 사용 중이던 장치 제거되었으면 다른 장치로 대치
    // TODO(대현) 현재 사용 가능한 장치 중 첫 번째 장치로 대치함. -> 다른 방법 있는지 생각.
    navigator.mediaDevices.ondevicechange = async function () {
      await initDevice();
      if (
        !roomStore.videoDeviceList.some(
          (device) => device.deviceId === roomStore.currentVideoDeviceId
        )
      ) {
        await roomStore.changeCamera(roomStore.videoDeviceList[0].deviceId);
        roomStore.setCurrentVideoDeviceId(
          roomStore.videoDeviceList[0].deviceId
        );
      }
      if (
        !roomStore.audioDeviceList.some(
          (device) => device.deviceId === roomStore.currentAudioDeviceId
        )
      ) {
        await roomStore.changeAudio(roomStore.audioDeviceList[0].deviceId);
        roomStore.setCurrentAudioDeviceId(
          roomStore.audioDeviceList[0].deviceId
        );
      }
    };

    const handleChangeCamera = async (
      e: React.ChangeEvent<HTMLSelectElement>
    ) => {
      roomStore.setCurrentVideoDeviceId(e.target.value);
      await roomStore.changeCamera(e.target.value);
    };
    const handleChangeAudio = async (
      e: React.ChangeEvent<HTMLSelectElement>
    ) => {
      roomStore.setCurrentAudioDeviceId(e.target.value);
      await roomStore.changeAudio(e.target.value);
    };

    return (
      <div>
        <select
          onChange={(e) => handleChangeCamera(e)}
          value={roomStore.currentVideoDeviceId}
        >
          {roomStore.videoDeviceList.map((device, index) => (
            <option key={index} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => handleChangeAudio(e)}
          defaultValue={roomStore.localAudioStream?.getTracks()[0].id}
        >
          {roomStore.audioDeviceList.map((device, index) => (
            <option key={index} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
        {/*  TODO 오디오 출력장치 바꾸는 거 구현*/}
        {/*<select>*/}
        {/*  {audioOutputDevicesList.map((device) => (*/}
        {/*    <option value={device.deviceId}>{device.label}</option>*/}
        {/*  ))}*/}
        {/*</select>*/}
      </div>
    );
  }
);

export const Video: NextPage<{
  id: string;
  videoStream: MediaStream | undefined;
  roomStore: RoomStore;
}> = ({ id, videoStream, roomStore }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video != null) {
      video.srcObject = videoStream === undefined ? null : videoStream;
    }
  }, [videoStream]);

  const handleVideoControl = (video: { userId: string }) => {
    const myVideo = videoRef.current;
    if (myVideo!.id !== "localVideo") {
      roomStore.getEnableHideRemoteVideoByUserId(video.userId)
        ? roomStore.hideRemoteVideo(video.userId)
        : roomStore.showRemoteVideo(video.userId);
    }
  };

  return (
    <video
      ref={videoRef}
      id={id}
      autoPlay
      className="video"
      muted
      onClick={() => handleVideoControl({ userId: id })}
    ></video>
  );
};

const Audio: NextPage<{
  id: string;
  audioStream: MediaStream | undefined;
}> = ({ id, audioStream }) => {
  const audioRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio != null) {
      audio.srcObject = audioStream === undefined ? null : audioStream;
    }
  }, [audioStream]);

  return <audio ref={audioRef} id={id} autoPlay></audio>;
};

const ChatMessage: NextPage<{ messages: ChatMessage[] }> = observer(
  ({ messages }) => {
    return (
      <>
        {messages.map((message) => {
          return (
            <div
              key={message.id}
              style={{ paddingBottom: "8px", paddingTop: "8px" }}
            >
              <div>{new Date(message.sentAt).toLocaleString()}</div>
              <div>
                <UserProfileImage userId={message.authorId} />
                {message.authorName}: {message.content}
              </div>
            </div>
          );
        })}
      </>
    );
  }
);
const PomodoroTimer: NextPage<{
  timerState: PomodoroTimerState;
  getElapsedSeconds: () => number;
  onClickStart: () => void;
}> = observer(({ timerState, getElapsedSeconds, onClickStart }) => {
  let backgroundColor: string;
  switch (timerState) {
    case PomodoroTimerState.STOPPED:
      backgroundColor = "cyan";
      break;
    case PomodoroTimerState.STARTED:
      backgroundColor = "red";
      break;
    case PomodoroTimerState.SHORT_BREAK:
      backgroundColor = "lightblue";
      break;
    case PomodoroTimerState.LONG_BREAK:
      backgroundColor = "yellow";
      break;
  }
  return (
    <div style={{ background: backgroundColor }}>
      <button id="timerStartButton" onClick={() => onClickStart()}>
        Start Timer!
      </button>
      <ElapsedTimeDisplay
        timerState={timerState}
        getElapsedSeconds={getElapsedSeconds}
      />
    </div>
  );
});

const ElapsedTimeDisplay: NextPage<{
  timerState: PomodoroTimerState;
  getElapsedSeconds: () => number;
}> = ({ timerState, getElapsedSeconds }) => {
  const [secondsWrapper, setSecondsWrapper] = useState({
    seconds: getElapsedSeconds(),
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsWrapper({ seconds: getElapsedSeconds() });
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [getElapsedSeconds]);

  const seconds =
    timerState === PomodoroTimerState.STOPPED ? 0 : secondsWrapper.seconds;

  return (
    <>
      {seconds >= 60 ? `${Math.floor(seconds / 60)}분 ` : undefined}
      {Math.floor(seconds % 60)}초 지남
    </>
  );
};

export default RoomScaffold;
