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
              <div id="remote-video-container"></div>
            </td>
          </tr>
        </tbody>
      </table>
      <RemoteVideoGroup
        remoteMediaStreamsByProducerId={
          roomStore.remoteMediaStreamsByProducerId
        }
      />
      <button id="video-toggle">Video OFF</button>
      <button id="audio-toggle">Audio OFF</button>
    </div>
  );
});

const RemoteVideoGroup: NextPage<{
  remoteMediaStreamsByProducerId: Map<string, MediaStream>;
}> = observer(({ remoteMediaStreamsByProducerId }) => {
  const entries = [...remoteMediaStreamsByProducerId.entries()];

  return (
    <div>
      {entries.map((entry) => {
        const [producerId, mediaStream] = entry;
        return (
          <Video key={producerId} id={producerId} mediaStream={mediaStream} />
        );
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
