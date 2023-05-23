import { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { RoomStore } from "@/stores/RoomStore";
import { useRouter } from "next/router";
import { ChatMessage } from "@/models/room/ChatMessage";
import { PomodoroTimerState } from "@/models/room/PomodoroTimerState";
import { TimerEditInputGroupStore } from "@/components/TimerEditInputGroup";
import { RoomState } from "@/models/room/RoomState";
import { UserProfileImage } from "@/components/UserProfileImage";
import { PeerState } from "@/models/room/PeerState";
import PopupMenu from "@/components/PopupMenu";
import { getEnumKeyByEnumValue } from "@/utils/EnumUtil";
import Button from "@mui/material/Button";
import { useStores } from "@/stores/context";
import WaitingRoom from "@/components/waitingRoom";
import studyRoomStyles from "@/styles/studyRoom.module.scss";
import { FaSlash } from "react-icons/fa";
import logo from "@/assets/logo.png";
import Image from "next/image";
import { TimerSettingDropDown } from "@/components/TimerSettingDropDown";
import { PomodoroTimerProperty } from "@/models/room/PomodoroTimerProperty";
import Modal from "react-modal";
import { UserStore } from "@/stores/UserStore";

export enum MasterPopupMenus {
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
      return <StudyRoom roomStore={roomStore} userStore={userStore} />;
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

const StudyRoom: NextPage<{ roomStore: RoomStore; userStore: UserStore }> =
  observer(({ roomStore, userStore }) => {
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
    const [open, setOpen] = useState(false);

    const [store, setStore] = useState<TimerEditInputGroupStore | undefined>(
      undefined
    );
    // const propertyInput = store.timerPropertyInput;

    useEffect(() => {
      if (roomStore.pomodoroTimerProperty !== undefined) {
        setStore(new TimerEditInputGroupStore(roomStore.pomodoroTimerProperty));
      }
    }, []);

    const handleHover = (event: React.MouseEvent<HTMLSpanElement>) => {
      console.log((event.target as HTMLElement).className);
      const position = (event.target as HTMLElement).getBoundingClientRect();
      const x = position.x - 8;
      const y = position.y - 45;
      document.getElementById("dialog")!.style.top = y.toString() + "px";
      document.getElementById("dialog")!.style.left = x.toString() + "px";
    };

    const timerArray: number[] = [20, 25, 30, 35, 40, 45, 50];
    const shortRestArray: number[] = [3, 4, 5, 6, 7, 8, 9, 10];
    const longRestArray: number[] = [10, 15, 20, 25, 30];
    const longRestIntervalArray: number[] = [2, 3, 4, 5, 6];
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

    const getVideoStream = (id: string) => {
      return roomStore.remoteVideoStreamByPeerIdEntries.find(
        ([peerId, mediaStream]) => {
          if (id === peerId) return true;
        }
      );
    };

    const getAudioStream = (id: string) => {
      return roomStore.remoteAudioStreamByPeerIdEntries.find(
        ([peerId, mediaStream]) => {
          if (id === peerId) return true;
        }
      );
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
        {/*<RoomSettingDialog*/}
        {/*  open={openSettingDialog}*/}
        {/*  onClose={() => setOpenSettingDialog(false)}*/}
        {/*  onUpdatedTimer={() => {*/}
        {/*    /* TODO: 구현 */}
        {/*  }}*/}
        {/*  onUnblockedUser={(user) => roomStore.unblockUser(user.id)}*/}
        {/*  blacklist={roomStore.blacklist}*/}
        {/*/>*/}
        <div
          className={`${studyRoomStyles["study-room__page"]}`}
          style={{
            height: "100vh",
          }}
        >
          <div className={`${studyRoomStyles["study-room__cam-form"]}`}>
            <div className={`${studyRoomStyles["study-room__user-form"]}`}>
              <div
                className={`${studyRoomStyles["study-room__user-form__grid"]}`}
              >
                {roomStore.peerStates.map((peerState) => {
                  const videoEntry = getVideoStream(peerState.uid);
                  let videoStream;
                  if (videoEntry != undefined) {
                    const [id, mediaStream] = videoEntry;
                    videoStream = mediaStream;
                  } else {
                    videoStream = undefined;
                  }
                  const audioEntry = getAudioStream(peerState.uid);
                  let audioStream;
                  if (audioEntry != undefined) {
                    const [id, mediaStream] = audioEntry;
                    audioStream = mediaStream;
                  } else {
                    audioStream = undefined;
                  }
                  return (
                    <GridView
                      roomStore={roomStore}
                      uid={userStore.currentUser!.id}
                      peerState={peerState}
                      isCurrentUserMaster={isCurrentUserMaster}
                      onBlockClick={handleBlockButtonClick}
                      onKickClick={handleKickButtonClick}
                      videoStream={
                        peerState.uid === userStore.currentUser?.id
                          ? roomStore.localVideoStream
                          : videoStream
                      }
                      audioStream={
                        peerState.uid === userStore.currentUser?.id
                          ? roomStore.localAudioStream
                          : audioStream
                      }
                    />
                  );
                })}

                {/*<div className={`${studyRoomStyles["study-room__user"]}`}>*/}
                {/*  <div*/}
                {/*    className={`${studyRoomStyles["study-room__user__video"]}`}*/}
                {/*  >*/}
                {/*    {enabledVideo ? (*/}
                {/*      <Video*/}
                {/*        id="localVideo"*/}
                {/*        videoStream={roomStore.localVideoStream}*/}
                {/*        roomStore={roomStore}*/}
                {/*      />*/}
                {/*    ) : (*/}
                {/*      <label className="typography__sub-headline">*/}
                {/*        카메라가 꺼져있습니다*/}
                {/*      </label>*/}
                {/*    )}*/}
                {/*  </div>*/}
                {/*  <div*/}
                {/*    className={`${studyRoomStyles["study-room__user__option-bar"]}`}*/}
                {/*  >*/}
                {/*    <label*/}
                {/*      className={`${studyRoomStyles["study-room__user__name"]} typography__text`}*/}
                {/*    >*/}
                {/*      본인*/}
                {/*    </label>*/}
                {/*    <div style={{ position: "relative" }}>*/}
                {/*      <span*/}
                {/*        className={`${studyRoomStyles["study-room__camera-icon"]} material-symbols-rounded`}*/}
                {/*      >*/}
                {/*        video_camera_front*/}
                {/*      </span>*/}
                {/*      {!enabledVideo && (*/}
                {/*        <FaSlash*/}
                {/*          className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}*/}
                {/*        />*/}
                {/*      )}*/}
                {/*    </div>*/}
                {/*    <div style={{ position: "relative" }}>*/}
                {/*      <span*/}
                {/*        className={`${studyRoomStyles["study-room__headphones-icon"]} material-symbols-rounded`}*/}
                {/*      >*/}
                {/*        headphones*/}
                {/*      </span>*/}
                {/*      {!enabledHeadset && (*/}
                {/*        <FaSlash*/}
                {/*          className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}*/}
                {/*        />*/}
                {/*      )}*/}
                {/*    </div>*/}
                {/*    <div style={{ position: "relative" }}>*/}
                {/*      <span*/}
                {/*        className={`${studyRoomStyles["study-room__mic-icon"]} material-symbols-rounded`}*/}
                {/*      >*/}
                {/*        mic*/}
                {/*      </span>*/}
                {/*      {!enabledAudio && (*/}
                {/*        <FaSlash*/}
                {/*          className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}*/}
                {/*        />*/}
                {/*      )}*/}
                {/*    </div>*/}
                {/*  </div>*/}
                {/*</div>*/}
                {/*<RemoteMediaGroup*/}
                {/*  roomStore={roomStore}*/}
                {/*  isCurrentUserMaster={isCurrentUserMaster}*/}
                {/*  peerStates={roomStore.peerStates}*/}
                {/*  remoteVideoStreamByPeerIdEntries={*/}
                {/*    roomStore.remoteVideoStreamByPeerIdEntries*/}
                {/*  }*/}
                {/*  remoteAudioStreamByPeerIdEntries={*/}
                {/*    roomStore.remoteAudioStreamByPeerIdEntries*/}
                {/*  }*/}
                {/*  onKickClick={handleKickButtonClick}*/}
                {/*  onBlockClick={handleBlockButtonClick}*/}
                {/*/>*/}
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
                  {roomStore.isCurrentUserMaster ? (
                    <span
                      className="material-symbols-outlined"
                      style={{ marginLeft: "auto", marginRight: 28 }}
                      onClick={() => setOpen(true)}
                    >
                      settings
                    </span>
                  ) : undefined}
                </div>
                <div
                  className={`${studyRoomStyles["study-room__timer-form__time"]}`}
                >
                  <label className="typography__display">
                    <PomodoroTimer
                      timerState={roomStore.pomodoroTimerState}
                      getElapsedSeconds={() =>
                        roomStore.pomodoroTimerElapsedSeconds
                      }
                      pomodoroTimerProperty={roomStore.pomodoroTimerProperty!}
                    />
                  </label>
                </div>
                {roomStore.pomodoroTimerProperty !== undefined ? (
                  <Modal
                    isOpen={open}
                    onRequestClose={() => setOpen(false)}
                    style={{
                      content: {
                        width: 388,
                        height: 354,
                        borderRadius: 20,
                        backgroundColor: "var(--system_ui-08)",
                        padding: 20,
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "unset",
                      },
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        color: "var(--system_background)",
                      }}
                    >
                      <span className="material-symbols-outlined">timer</span>
                      <label
                        className={`${studyRoomStyles["study-room__timer-form__subtitle__label"]} typography__text--big`}
                      >
                        타이머 편집
                      </label>
                    </div>
                    {store !== undefined ? (
                      <>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 34,
                            marginTop: 20,
                            marginBottom: 24,
                          }}
                        >
                          <TimerSettings
                            title={"뽀모도로 시간"}
                            suffix={"분"}
                            options={timerArray}
                            selectedValue={
                              store.timerPropertyInput.timerLengthMinutes
                            }
                            onSelect={store.onChangeTimerLengthInput}
                          />
                          <TimerSettings
                            title={"짧은 휴식 시간"}
                            suffix={"분"}
                            options={shortRestArray}
                            selectedValue={
                              store.timerPropertyInput.shortBreakMinutes
                            }
                            onSelect={store.onChangeShortBreakInput}
                          />
                          <TimerSettings
                            title={"긴 휴식 시간"}
                            suffix={"분"}
                            options={longRestArray}
                            selectedValue={
                              store.timerPropertyInput.longBreakMinutes
                            }
                            onSelect={store.onChangeLongBreakInput}
                          />
                          <TimerSettings
                            title={"긴 휴식 시간 간격"}
                            suffix={"번"}
                            options={longRestIntervalArray}
                            selectedValue={
                              store.timerPropertyInput.longBreakInterval
                            }
                            onSelect={store.onChangeLongBreakIntervalInput}
                          />
                        </div>
                        <button
                          className={"timerSettingBtn"}
                          onClick={() => {
                            roomStore.updateAndStopPomodoroTimer(
                              store!.timerPropertyInput
                            );
                            setOpen(false);
                          }}
                          style={{ color: "var(--system_background)" }}
                        >
                          타이머 저장 및 초기화
                        </button>
                      </>
                    ) : undefined}
                  </Modal>
                ) : undefined}
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
                      {`${roomStore.pomodoroTimerProperty?.timerLengthMinutes}분 집중, ${roomStore.pomodoroTimerProperty?.shortBreakMinutes}분 휴식을 ${roomStore.pomodoroTimerProperty?.longBreakInterval}번 반복 후 ${roomStore.pomodoroTimerProperty?.longBreakMinutes}분간 쉽니다.`}
                      {/*25분 집중, 5분 휴식을 4번 반복 후 30분간 쉽니다*/}
                    </label>
                  </div>
                  {roomStore.pomodoroTimerState !==
                  PomodoroTimerState.STOPPED ? undefined : (
                    <button
                      className={`${studyRoomStyles["study-room__timer-form__info__button"]}`}
                      onClick={() => {
                        roomStore.startTimer();
                      }}
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
                          {roomStore.blacklist.map((blockedUser, key) => (
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
                                {blockedUser.name}
                              </label>
                              <label
                                className={`${studyRoomStyles["study-room__chat-form__ban-user__ban-cancel"]} typography__text`}
                                onClick={() =>
                                  roomStore.unblockUser(blockedUser.id)
                                }
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
                  <ChatMessage messages={roomStore.chatMessages} />
                  {/*<label*/}
                  {/*  className={`${studyRoomStyles["study-room__chat-form__text-field__notice"]}`}*/}
                  {/*>*/}
                  {/*  홍길동님이 스터디 룸을 개설했습니다.*/}
                  {/*</label>*/}
                </div>

                <input
                  value={roomStore.chatInput}
                  onChange={(e) => roomStore.updateChatInput(e.target.value)}
                  type={"text"}
                  placeholder={"채팅 내용을 입력해주세요"}
                  className={`${studyRoomStyles["study-room__chat-form__input"]} typography__text--small`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                      roomStore.sendChat();
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {/*<DeviceSelector roomStore={roomStore}></DeviceSelector>*/}
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

            button {
              background: inherit;
              border: none;
              box-shadow: none;
              border-radius: 0;
              padding: 0;
              overflow: visible;
              cursor: pointer;
            }

            .timerSettingBtn {
              display: flex;
              flex-direction: row;
              flex-grow: 1;
              justify-content: center;
              align-items: center;
              padding: 8px 16px;
              gap: 10px;

              //width: 340px;
              height: 38px;

              /* Primary-05 */
              background: var(--primary);
              border-radius: 8px;
            }
          `}
        </style>
      </div>
    );
  });

const GridView: NextPage<{
  videoStream: MediaStream | undefined;
  audioStream: MediaStream | undefined;
  peerState: PeerState;
  uid: string;
  roomStore: RoomStore;
  isCurrentUserMaster: boolean;
  onKickClick: (userId: string) => void;
  onBlockClick: (userId: string) => void;
}> = observer(
  ({
    videoStream,
    audioStream,
    peerState,
    uid,
    roomStore,
    isCurrentUserMaster,
    onBlockClick,
    onKickClick,
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

    //TODO: 카메라 껐을 때 리렌더링 하기 위해 하드코딩 함. 나중에 고칠 것
    useEffect(() => {
      console.log("video closed");
    }, [roomStore.reRender]);

    return (
      <div className={`${studyRoomStyles["study-room__user"]}`}>
        <div className={`${studyRoomStyles["study-room__user__video"]}`}>
          {videoStream != null && videoStream.active ? (
            <Video
              id={peerState.uid}
              key={peerState.uid}
              videoStream={videoStream}
              roomStore={roomStore}
            />
          ) : (
            <label className="typography__sub-headline">
              카메라가 꺼져있습니다
            </label>
          )}
        </div>
        <div className={`${studyRoomStyles["study-room__user__option-bar"]}`}>
          <label
            className={`${studyRoomStyles["study-room__user__name"]} typography__text`}
          >
            {peerState.name}
          </label>
          <div style={{ position: "relative" }}>
            <span
              className={`${studyRoomStyles["study-room__camera-icon"]} material-symbols-rounded`}
            >
              video_camera_front
            </span>
            {!(videoStream != null && videoStream.active) ? (
              <FaSlash
                className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}
              />
            ) : undefined}
          </div>
          {peerState.uid === uid ? (
            <>
              <div style={{ position: "relative" }}>
                <span
                  className={`${studyRoomStyles["study-room__headphones-icon"]} material-symbols-rounded`}
                >
                  headphones
                </span>
                {!roomStore.enabledHeadset ? (
                  <FaSlash
                    className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}
                  />
                ) : undefined}
              </div>
              <div style={{ position: "relative" }}>
                <span
                  className={`${studyRoomStyles["study-room__mic-icon"]} material-symbols-rounded`}
                >
                  mic
                </span>
                {!roomStore.enabledLocalAudio ? (
                  <FaSlash
                    className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}
                  />
                ) : undefined}
              </div>
            </>
          ) : (
            <>
              <div style={{ position: "relative" }}>
                <span
                  className={`${studyRoomStyles["study-room__headphones-icon"]} material-symbols-rounded`}
                >
                  headphones
                </span>
                {!peerState.enabledHeadset ? (
                  <FaSlash
                    className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}
                  />
                ) : undefined}
              </div>
              <div style={{ position: "relative" }}>
                <span
                  className={`${studyRoomStyles["study-room__mic-icon"]} material-symbols-rounded`}
                >
                  mic
                </span>
                {!peerState.enabledMicrophone ? (
                  <FaSlash
                    className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}
                  />
                ) : undefined}
              </div>
            </>
          )}
          {isCurrentUserMaster &&
            roomStore.userMasterId != undefined &&
            roomStore.userMasterId !== peerState.uid && (
              <PopupMenu
                label={"더보기"}
                menuItems={masterPopupMenus}
                onMenuItemClick={(item) =>
                  handleMasterPopupMenuClick(item, peerState.uid)
                }
                name={peerState.name}
              />
            )}
        </div>
        <div>
          <Audio
            key={peerState.uid}
            id={peerState.uid}
            audioStream={audioStream}
          />
        </div>
      </div>
    );
  }
);

const TimerSettings: NextPage<{
  title: string;
  suffix: string;
  options: number[];
  selectedValue: number;
  onSelect: (input: string) => void;
}> = ({ title, suffix, options, selectedValue, onSelect }) => {
  return (
    <div
      className={`${studyRoomStyles["study-room__timer-form__time-set"]}`}
      style={{ display: "flex", alignItems: "center" }}
    >
      <label className="typography__text timer-setting__title">{title}</label>
      <TimerSettingDropDown
        items={options}
        suffix={suffix}
        type={"time"}
        selectedValue={selectedValue}
        onSelect={onSelect}
      />
      <style jsx>{`
        .timer-setting__title {
          height: 22px;

          /* Pretendard / 16px / 16px: SemiBold */
          font-style: normal;
          font-weight: 600;
          font-size: 16px;
          line-height: 22px;
          /* identical to box height, or 138% */

          display: flex;
          align-items: center;
          letter-spacing: -0.5px;

          /* White */
          color: var(--ui-cardui);
        }
      `}</style>
    </div>
  );
};

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

    //TODO: 카메라 껐을 때 리렌더링 하기 위해 하드코딩 함. 나중에 고칠 것
    useEffect(() => {
      console.log("video closed");
    }, [roomStore.reRender]);

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
                {mediaStream.active ? (
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
                <div style={{ position: "relative" }}>
                  <span
                    className={`${studyRoomStyles["study-room__camera-icon"]} material-symbols-rounded`}
                  >
                    video_camera_front
                  </span>
                  {!mediaStream.active ? (
                    <FaSlash
                      className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}
                    />
                  ) : undefined}
                </div>
                <div style={{ position: "relative" }}>
                  <span
                    className={`${studyRoomStyles["study-room__headphones-icon"]} material-symbols-rounded`}
                  >
                    headphones
                  </span>
                  {!peerState.enabledHeadset ? (
                    <FaSlash
                      className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}
                    />
                  ) : undefined}
                </div>
                <div style={{ position: "relative" }}>
                  <span
                    className={`${studyRoomStyles["study-room__mic-icon"]} material-symbols-rounded`}
                  >
                    mic
                  </span>
                  {!peerState.enabledMicrophone ? (
                    <FaSlash
                      className={`${studyRoomStyles["study-room__slash-icon"]} material-symbols-rounded`}
                    />
                  ) : undefined}
                </div>
                {isCurrentUserMaster &&
                  roomStore.userMasterId !== peerState.uid && (
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
            </div>
          );
        })}

        <div>
          {remoteAudioStreamByPeerIdEntries.map((entry) => {
            const [peerId, mediaStream] = entry;
            return <Audio key={peerId} id={peerId} audioStream={mediaStream} />;
          })}
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
      style={{ width: "inherit", height: "inherit" }}
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
    useEffect(() => {
      const chatContainer = document.getElementById("chatContainer");
      chatContainer!.scrollTop = chatContainer!.scrollHeight;
    });

    return (
      <div style={{ overflow: "scroll", maxHeight: 604 }} id={"chatContainer"}>
        {messages.map((message) => {
          return (
            <div
              key={message.id}
              className={`${studyRoomStyles["study-room__chat-form__text-field__chat"]} typography__text--small`}
            >
              <label
                className={`${studyRoomStyles["study-room__chat-form__text-field__name"]}`}
              >
                {message.authorName}
              </label>
              <label
                className={`${studyRoomStyles["study-room__chat-form__text-field__text"]}`}
              >
                {message.content}
              </label>
            </div>
          );
        })}
      </div>
    );
  }
);

const PomodoroTimer: NextPage<{
  timerState: PomodoroTimerState;
  getElapsedSeconds: () => number;
  pomodoroTimerProperty: PomodoroTimerProperty;
}> = observer(({ timerState, getElapsedSeconds, pomodoroTimerProperty }) => {
  return (
    <ElapsedTimeDisplay
      timerState={timerState}
      getElapsedSeconds={getElapsedSeconds}
      pomodoroTimerProperty={pomodoroTimerProperty}
    />
  );
});

const ElapsedTimeDisplay: NextPage<{
  timerState: PomodoroTimerState;
  getElapsedSeconds: () => number;
  pomodoroTimerProperty: PomodoroTimerProperty;
}> = ({ timerState, getElapsedSeconds, pomodoroTimerProperty }) => {
  const [secondsWrapper, setSecondsWrapper] = useState({
    seconds: getElapsedSeconds(),
  });

  let color: string;
  switch (timerState) {
    case PomodoroTimerState.STOPPED:
      color = "var(--system_background)";
      break;
    case PomodoroTimerState.STARTED:
      color = "var(--primary)";
      break;
    case PomodoroTimerState.SHORT_BREAK:
      color = "#35DC8C";
      break;
    case PomodoroTimerState.LONG_BREAK:
      color = "#2A8CFE";
      break;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsWrapper({ seconds: getElapsedSeconds() });
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [getElapsedSeconds]);

  const seconds =
    timerState === PomodoroTimerState.STOPPED
      ? pomodoroTimerProperty.timerLengthMinutes
      : secondsWrapper.seconds;

  const formatTime = (time: number) => {
    switch (timerState) {
      case PomodoroTimerState.STOPPED:
        time = 0;
        break;
      case PomodoroTimerState.STARTED:
        time = pomodoroTimerProperty.timerLengthMinutes * 60 - time;
        break;
      case PomodoroTimerState.SHORT_BREAK:
        time = pomodoroTimerProperty.shortBreakMinutes * 60 - time;
        break;
      case PomodoroTimerState.LONG_BREAK:
        time = pomodoroTimerProperty.longBreakMinutes * 60 - time;
        break;
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return <div style={{ color: color }}>{formatTime(seconds)}</div>;
};

export default RoomScaffold;
