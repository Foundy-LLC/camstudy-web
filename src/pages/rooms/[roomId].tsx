import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { RoomStore } from "@/stores/RoomStore";

const Room: NextPage = observer(() => {
  const [roomStore] = useState(new RoomStore());

  const enabledVideo = roomStore.enabledVideo;

  useEffect(() => {
    roomStore.connectSocket();
  }, []);

  return (
    <div>
      <table className="mainTable">
        <tbody>
          <tr>
            <td className="localColumn">
              <Video id="localVideo" mediaStream={roomStore.localVideoStream} />
            </td>
            <td className="remoteColumn">
              <RemoteVideoGroup
                remoteMediaStreamsByPeerId={
                  roomStore.remoteMediaStreamsByPeerId
                }
              />
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
      <button id="audioToggle">Turn off audio</button>
    </div>
  );
});

const RemoteVideoGroup: NextPage<{
  remoteMediaStreamsByPeerId: Map<string, MediaStream>;
}> = observer(({ remoteMediaStreamsByPeerId }) => {
  const entries = [...remoteMediaStreamsByPeerId.entries()];

  return (
    <div>
      {entries.map((entry) => {
        const [peerId, mediaStream] = entry;
        return <Video key={peerId} id={peerId} mediaStream={mediaStream} />;
      })}
    </div>
  );
});

const Video: NextPage<{ id: string; mediaStream: MediaStream | undefined }> = ({
  id,
  mediaStream,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>();

  useEffect(() => {
    const video = videoRef.current;
    if (video && mediaStream !== undefined) {
      video.srcObject = mediaStream;
    }
  }, [mediaStream]);

  return (
    <video
      ref={(video) => (videoRef.current = video)}
      id={id}
      autoPlay
      className="video"
      muted
    ></video>
  );
};

export default Room;
