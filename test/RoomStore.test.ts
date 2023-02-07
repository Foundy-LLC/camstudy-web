import { RoomStore } from "@/stores/RoomStore";
import { deepEqual, instance, mock, when } from "ts-mockito";
import { RoomState } from "@/models/room/RoomState";
import { MediaUtil } from "@/utils/MediaUtil";
import { PomodoroTimerState } from "@/models/room/PomodoroTimerState";

describe("RoomStore.onConnected", () => {
  it("should set state to CONNECTED", async () => {
    // given
    const mediaUtil = mock<MediaUtil>();
    when(mediaUtil.fetchLocalMedia({ video: true, audio: true })).thenResolve(
      mock()
    );
    when(
      mediaUtil.getMediaStreamUsingFirstVideoTrackOf(deepEqual(mock()))
    ).thenReturn(mock());
    when(
      mediaUtil.getMediaStreamUsingFirstAudioTrackOf(deepEqual(mock()))
    ).thenReturn(mock());
    const roomStore = new RoomStore(instance(mediaUtil));

    // when
    await roomStore.onConnected();

    // then
    expect(roomStore.state).toBe(RoomState.CONNECTED);
  });
});

describe("RoomStore.onJoined", () => {
  it("should set state to JOINED", () => {
    // given
    const roomStore = new RoomStore();

    // when
    roomStore.onJoined(new Date().toISOString(), mock(), mock());

    // then
    expect(roomStore.state).toBe(RoomState.JOINED);
  });
});

describe("after invoking RoomStore.onUpdatedPomodoroTimer", () => {
  it("should timer state to be STOPPED", () => {
    // given
    const roomStore = new RoomStore();

    // when
    roomStore.onUpdatedPomodoroTimer(mock());

    // then
    expect(roomStore.pomodoroTimerState).toBe(PomodoroTimerState.STOPPED);
  });

  it("should elapsed time to be 0", () => {
    // given
    const roomStore = new RoomStore();

    // when
    roomStore.onUpdatedPomodoroTimer(mock());

    // then
    expect(roomStore.pomodoroTimerElapsedSeconds).toBe(0);
  });
});

export {};
