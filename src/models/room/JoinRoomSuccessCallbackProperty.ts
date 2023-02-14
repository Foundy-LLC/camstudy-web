import { RtpCapabilities } from "mediasoup-client/lib/RtpParameters";
import { PomodoroTimerState } from "@/models/room/PomodoroTimerState";
import { PomodoroTimerProperty } from "@/models/room/PomodoroTimerProperty";
import { PeerState } from "@/models/room/PeerState";

// TODO: camstudy-webrtc-server와 중복되는 인테페이스임. 하나로 관리할 방법을 찾아야함
export interface JoinRoomSuccessCallbackProperty {
  readonly type: "success";
  readonly rtpCapabilities: RtpCapabilities;
  readonly peerStates: PeerState[];
  readonly timerStartedDate?: string;
  readonly timerState: PomodoroTimerState;
  readonly timerProperty: PomodoroTimerProperty;
}
