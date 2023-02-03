import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { ChatMessage, RoomStore } from "@/stores/RoomStore";
import { useRouter } from "next/router";

const Room: NextPage = observer(() => {
  const [roomStore] = useState(new RoomStore());
  const router = useRouter();
  const roomId = router.query.roomId;

  const enabledVideo = roomStore.enabledLocalVideo;
  const enabledAudio = roomStore.enabledLocalAudio;

  useEffect(() => {
    if (roomId !== undefined) {
      roomStore.connectSocket(roomId as string);
    }
  }, [roomId]);

  return (
    <div>
      <table className="mainTable">
        <tbody>
          <tr>
            <td className="localColumn">
              <Video id="localVideo" videoStream={roomStore.localVideoStream} />
              <Audio id="localAudio" audioStream={roomStore.localAudioStream} />
            </td>
            <td className="remoteColumn">
              <RemoteMediaGroup
                remoteVideoStreamsByPeerId={
                  roomStore.remoteVideoStreamsByPeerId
                }
                remoteAudioStreamsByPeerId={
                  roomStore.remoteAudioStreamsByPeerId
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
    </div>
  );
});

const RemoteMediaGroup: NextPage<{
  remoteVideoStreamsByPeerId: Map<string, MediaStream>;
  remoteAudioStreamsByPeerId: Map<string, MediaStream>;
}> = observer(({ remoteVideoStreamsByPeerId, remoteAudioStreamsByPeerId }) => {
  const videoEntries = [...remoteVideoStreamsByPeerId.entries()];
  const audioEntries = [...remoteAudioStreamsByPeerId.entries()];

  return (
    <>
      <div>
        {videoEntries.map((entry) => {
          const [peerId, mediaStream] = entry;
          return <Video key={peerId} id={peerId} videoStream={mediaStream} />;
        })}
      </div>
      <div>
        {audioEntries.map((entry) => {
          const [peerId, mediaStream] = entry;
          return <Audio key={peerId} id={peerId} audioStream={mediaStream} />;
        })}
      </div>
    </>
  );
});

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

export default Room;
