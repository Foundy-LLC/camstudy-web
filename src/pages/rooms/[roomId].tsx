import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { RoomStore } from "@/stores/RoomStore";

const Room: NextPage = observer(() => {
  const [roomStore] = useState(new RoomStore());

  useEffect(() => {
    roomStore.connectSocket();
  }, []);

  return (
    <div>
      <table className="mainTable">
        <tbody>
          <tr>
            <td className="localColumn">
              <Video id="localVideo" mediaStream={roomStore.localMediaStream} />
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
      <button id="videoToggle">Hide video</button>
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
  const localVideoRef = useRef<HTMLVideoElement | null>();

  useEffect(() => {
    const localVideo = localVideoRef.current;
    if (localVideo && mediaStream !== undefined) {
      localVideo.srcObject = mediaStream;
    }
  }, [mediaStream]);

  return (
    <video
      ref={(video) => (localVideoRef.current = video)}
      id={id}
      autoPlay
      className="video"
      muted
    ></video>
  );
};

export default Room;
