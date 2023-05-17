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
import WaitingRoom from "@/pages/waitingRoom";

enum MasterPopupMenus {
  Kick = "강퇴",
  Block = "차단",
}

const RoomScaffold: NextPage = observer(() => {
  const { userStore } = useStores();
  const { roomListStore } = useStores();
  const [roomStore] = useState(() => new RoomStore(userStore));
  const { roomListStore } = useStores();
  const router = useRouter();
  const roomId = router.query.roomId;

  useEffect(() => {
    if (typeof roomId === "string") {
      roomStore.connectSocket(roomId);
      roomListStore.getRoomById(roomId);
    }
  }, [roomStore, roomId]);

  useEffect(() => {
    if (!roomListStore.roomInfo) return;
    console.log(roomListStore.roomInfo);
  }, [roomListStore.roomInfo]);

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
      <div>
        <RoomSettingDialog
          open={openSettingDialog}
          onClose={() => setOpenSettingDialog(false)}
          onUpdatedTimer={() => {
            /* TODO: 구현 */
          }}
          onUnblockedUser={(user) => roomStore.unblockUser(user.id)}
          blacklist={roomStore.blacklist}
        />

        <table className="mainTable">
          <tbody>
            <tr>
              <td className="localColumn">
                <Video
                  id="localVideo"
                  videoStream={roomStore.localVideoStream}
                  roomStore={roomStore}
                />
                {!enabledHeadset ? "헤드셋 꺼짐!" : ""}
                {!enabledAudio ? "마이크 꺼짐!" : ""}
              </td>
              <td className="remoteColumn">
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
              </td>
              <td className="chatMessageColumn">
                <ChatMessage messages={roomStore.chatMessages} />
                <input
                  value={roomStore.chatInput}
                  onChange={(e) => roomStore.updateChatInput(e.target.value)}
                />
                <button
                  disabled={!roomStore.enabledChatSendButton}
                  onClick={() => roomStore.sendChat()}
                >
                  전송
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <button
          id="videoToggle"
          onClick={() =>
            enabledVideo ? roomStore.hideVideo() : roomStore.showVideo()
          }
        >
          {enabledVideo ? "Hide Video" : "Show Video"}
        </button>
        <button
          id="microphoneToggle"
          onClick={() =>
            enabledAudio
              ? roomStore.muteMicrophone()
              : roomStore.unmuteMicrophone()
          }
        >
          {enabledAudio ? "Mute Mic" : "Unmute Mic"}
        </button>
        <button
          id="headphoneToggle"
          onClick={() =>
            enabledHeadset ? roomStore.muteHeadset() : roomStore.unmuteHeadset()
          }
        >
          {enabledHeadset ? "Mute Headset" : "Unmute Headset"}
        </button>
        <DeviceSelector roomStore={roomStore}></DeviceSelector>
        <div>
          <PomodoroTimer
            timerState={roomStore.pomodoroTimerState}
            getElapsedSeconds={() => roomStore.pomodoroTimerElapsedSeconds}
            onClickStart={() => roomStore.startTimer()}
          />
          {/* TODO: 관리자인 경우만 타이머 편집 부분 보이기*/}
          {roomStore.pomodoroTimerProperty !== undefined ? (
            <TimerEditInputGroup
              defaultTimerProperty={roomStore.pomodoroTimerProperty}
              onClickSave={roomStore.updateAndStopPomodoroTimer}
            />
          ) : undefined}
        </div>
        {isCurrentUserMaster && (
          <div>
            <Button onClick={() => setOpenSettingDialog(true)}>설정</Button>
          </div>
        )}
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
        <div>
          {remoteVideoStreamByPeerIdEntries.map((entry) => {
            const [peerId, mediaStream] = entry;
            const peerState = peerStates.find((p) => p.uid === peerId);
            if (peerState === undefined) {
              throw Error("피어 상태가 존재하지 않습니다.");
            }
            return (
              <div key={peerId}>
                <Video
                  id={peerId}
                  videoStream={mediaStream}
                  roomStore={roomStore}
                />
                {peerState.enabledMicrophone ? "" : "마이크 끔!"}
                {peerState.enabledHeadset ? "" : "헤드셋 끔!"}
                {isCurrentUserMaster && (
                  <PopupMenu
                    label={"더보기"}
                    menuItems={masterPopupMenus}
                    onMenuItemClick={(item) =>
                      handleMasterPopupMenuClick(item, peerId)
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
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
