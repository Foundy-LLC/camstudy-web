import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { ChatMessage, RoomState, RoomStore } from "@/stores/RoomStore";
import { useRouter } from "next/router";
import { PomodoroTimerState } from "@/models/room/PomodoroTimerState";
import { TimerEditInputGroup } from "@/components/TimerEditInputGroup";

const RoomScaffold: NextPage = observer(() => {
  const [roomStore] = useState(new RoomStore());

  useEffect(() => {
    roomStore.connectSocket();
  }, []);

  switch (roomStore.state) {
    case RoomState.CREATED:
    case RoomState.CONNECTED:
      return <RoomReady roomStore={roomStore} />;
    case RoomState.JOINED:
      return <Room roomStore={roomStore} />;
  }
});

const RoomReady: NextPage<{
  roomStore: RoomStore;
}> = observer(({ roomStore }) => {
  const router = useRouter();
  const roomId = router.query.roomId;

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
            ? roomStore.muteAudio()
            : roomStore.unmuteAudio()
        }
      >
        {roomStore.enabledLocalAudio ? "Mute Audio" : "Unmute Audio"}
      </button>
      {typeof roomId === "string" ? (
        <button onClick={() => roomStore.joinRoom(roomId)}>입장</button>
      ) : undefined}
    </>
  );
});

const Room: NextPage<{ roomStore: RoomStore }> = observer(({ roomStore }) => {
  const enabledVideo = roomStore.enabledLocalVideo;
  const enabledAudio = roomStore.enabledLocalAudio;

  return (
    <div>
      <table className="mainTable">
        <tbody>
          <tr>
            <td className="localColumn">
              <Video id="localVideo" videoStream={roomStore.localVideoStream} />
            </td>
            <td className="remoteColumn">
              <RemoteMediaGroup
                remoteVideoStreamByPeerIdEntries={
                  roomStore.remoteVideoStreamByPeerIdEntries
                }
                remoteAudioStreamByPeerIdEntries={
                  roomStore.remoteAudioStreamByPeerIdEntries
                }
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
        id="audioToggle"
        onClick={() =>
          enabledAudio ? roomStore.muteAudio() : roomStore.unmuteAudio()
        }
      >
        {enabledAudio ? "Mute Audio" : "Unmute Audio"}
      </button>
      <div>
        <PomodoroTimer
          timerState={roomStore.pomodoroTimerState}
          getElapsedSeconds={() => roomStore.pomodoroTimerElapsedSeconds}
          onClickStart={() => roomStore.startTimer()}
        />
        // TODO: 관리자인 경우만 타이머 편집 부분 보이기
        {roomStore.pomodoroTimerProperty !== undefined ? (
          <TimerEditInputGroup
            defaultTimerProperty={roomStore.pomodoroTimerProperty}
            onClickSave={roomStore.updateAndStopPomodoroTimer}
          />
        ) : undefined}
      </div>
    </div>
  );
});

const RemoteMediaGroup: NextPage<{
  remoteVideoStreamByPeerIdEntries: [string, MediaStream][];
  remoteAudioStreamByPeerIdEntries: [string, MediaStream][];
}> = observer(
  ({ remoteVideoStreamByPeerIdEntries, remoteAudioStreamByPeerIdEntries }) => {
    return (
      <>
        <div>
          {remoteVideoStreamByPeerIdEntries.map((entry) => {
            const [peerId, mediaStream] = entry;
            return <Video key={peerId} id={peerId} videoStream={mediaStream} />;
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
            <div key={message.id}>
              {message.authorName}: {message.content}
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
}> = ({ timerState, getElapsedSeconds, onClickStart }) => {
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
      <ElapsedTimeDisplay getElapsedSeconds={getElapsedSeconds} />
    </div>
  );
};

const ElapsedTimeDisplay: NextPage<{
  getElapsedSeconds: () => number;
}> = ({ getElapsedSeconds }) => {
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
  }, []);

  const seconds = secondsWrapper.seconds;

  return (
    <>
      {seconds >= 60 ? `${(seconds / 60).toFixed(0)}분 ` : undefined}
      {(seconds % 60).toFixed(0)}초 지남
    </>
  );
};

export default RoomScaffold;
