import { RoomStore } from "@/stores/RoomStore";
import { deepEqual, instance, mock, when } from "ts-mockito";
import { RoomState } from "@/models/room/RoomState";
import { MediaUtil } from "@/utils/MediaUtil";
import { PomodoroTimerState } from "@/models/room/PomodoroTimerState";
import {
  OtherPeerExitedRoomEvent,
  OtherPeerJoinedRoomEvent,
} from "@/models/room/WaitingRoomEvent";
import { MAX_ROOM_CAPACITY } from "@/constants/room.constant";
import { RoomJoiner } from "@/models/room/RoomJoiner";

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

describe("RoomStore.onWaitingRoomEvent", () => {
  let roomStore: RoomStore;

  beforeAll(() => {
    roomStore = new RoomStore();
    roomStore.onConnectedWaitingRoom({
      joinerList: [],
      masterId: "masterId",
      capacity: MAX_ROOM_CAPACITY,
    });
  });

  it("should add joiner when event is OtherPeerJoinedRoomEvent", () => {
    // given
    const joiner: RoomJoiner = { id: "id", name: "name" };
    const event = new OtherPeerJoinedRoomEvent(joiner);

    // when
    roomStore.onWaitingRoomEvent(event);

    // then
    expect(roomStore.roomJoiners.toString()).toBe([joiner].toString());
  });

  it("should remove joiner when event is OtherPeerExitedRoomEvent", () => {
    // given
    const joiner: RoomJoiner = { id: "id", name: "name" };
    const joinEvent = new OtherPeerJoinedRoomEvent(joiner);
    const exitEvent = new OtherPeerExitedRoomEvent(joiner.id);
    roomStore.onWaitingRoomEvent(joinEvent);

    // when
    roomStore.onWaitingRoomEvent(exitEvent);

    // then
    expect(roomStore.roomJoiners.length).toBe(0);
  });
});

export {};
