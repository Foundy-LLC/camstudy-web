import {NextComponentType, NextPage} from "next";
import {useEffect, useRef} from "react";
import {observer} from "mobx-react";
import roomStore from "@/stores/RoomStore";

const Room: NextPage = () => {

    useEffect(() => {
        roomStore.connectSocket()
    }, [])

    return (
        <div>
            <table className="mainTable">
                <tbody>
                <tr>
                    <td className="localColumn">
                        <LocalVideo/>
                    </td>
                    <td className="remoteColumn">
                        <div id="remote-video-container"></div>
                    </td>
                </tr>
                </tbody>
            </table>
            <table>
                <tbody>
                <tr>
                    <td></td>
                </tr>
                </tbody>
            </table>
            <button id="video-toggle">Video OFF</button>
            <button id="audio-toggle">Audio OFF</button>
        </div>
    )
}

const LocalVideo: NextComponentType = observer(() => {
    const localMediaStream = roomStore.localMediaStream
    const localVideoRef = useRef<HTMLVideoElement | null>()

    useEffect(() => {
        const localVideo = localVideoRef.current
        if (localVideo && localMediaStream !== undefined) {
            localVideo.srcObject = localMediaStream
        }
    }, [localMediaStream])

    return (
        <video ref={video => localVideoRef.current = video} id="localVideo" autoPlay className="video"
               muted></video>
    )
})

export default Room