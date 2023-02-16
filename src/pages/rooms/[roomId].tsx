import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
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
import { useAuth } from "@/components/AuthProvider";

enum MasterPopupMenus {
  Kick = "강퇴",
  Block = "차단",
}

const RoomScaffold: NextPage = observer(() => {
  const [roomStore] = useState(new RoomStore());
  const router = useRouter();
  const roomId = router.query.roomId;

  useEffect(() => {
    if (typeof roomId === "string") {
      roomStore.connectSocket(roomId);
    }
  }, [roomStore, roomId]);

  if (roomStore.failedToSignIn) {
    router.replace("/login");
    return <></>;
  }

  switch (roomStore.state) {
    case RoomState.CREATED:
    case RoomState.CONNECTED:
    case RoomState.WAITING_ROOM:
      return <WaitingRoom roomStore={roomStore} />;
    case RoomState.JOINED:
      return <StudyRoom roomStore={roomStore} />;
  }
});

const WaitingRoom: NextPage<{
  roomStore: RoomStore;
}> = observer(({ roomStore }) => {
  return (
    <>
      <Video id="localVideo" videoStream={roomStore.localVideoStream} />
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
        {roomStore.failedToJoinMessage !== undefined ? (
          <div>{roomStore.failedToJoinMessage}</div>
        ) : undefined}
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
    const router = useRouter();

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
        <table className="mainTable">
          <tbody>
            <tr>
              <td className="localColumn">
                <Video
                  id="localVideo"
                  videoStream={roomStore.localVideoStream}
                />
                {!enabledHeadset ? "헤드셋 꺼짐!" : ""}
                {!enabledAudio ? "마이크 꺼짐!" : ""}
              </td>
              <td className="remoteColumn">
                <RemoteMediaGroup
                  isCurrentUserMaster={roomStore.isCurrentUserMaster}
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
      </div>
    );
  }
);

const RemoteMediaGroup: NextPage<{
  isCurrentUserMaster: boolean;
  peerStates: PeerState[];
  remoteVideoStreamByPeerIdEntries: [string, MediaStream][];
  remoteAudioStreamByPeerIdEntries: [string, MediaStream][];
  onKickClick: (userId: string) => void;
  onBlockClick: (userId: string) => void;
}> = observer(
  ({
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
                <Video id={peerId} videoStream={mediaStream} />
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

const Video: NextPage<{
  id: string;
  videoStream: MediaStream | undefined;
}> = ({ id, videoStream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video != null) {
      video.srcObject = videoStream === undefined ? null : videoStream;
    }
  }, [videoStream]);

  return (
    <video ref={videoRef} id={id} autoPlay className="video" muted></video>
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
      {seconds >= 60 ? `${(seconds / 60).toFixed(0)}분 ` : undefined}
      {(seconds % 60).toFixed(0)}초 지남
    </>
  );
};

export default RoomScaffold;
