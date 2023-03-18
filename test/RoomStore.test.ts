import { RoomStore } from "@/stores/RoomStore";
import { instance, mock, when } from "ts-mockito";
import { RoomState } from "@/models/room/RoomState";
import { MediaUtil } from "@/utils/MediaUtil";
import { PomodoroTimerState } from "@/models/room/PomodoroTimerState";
import {
  OtherPeerExitedRoomEvent,
  OtherPeerJoinedRoomEvent,
} from "@/models/room/WaitingRoomEvent";
import { MAX_ROOM_CAPACITY } from "@/constants/room.constant";
import { RoomJoiner } from "@/models/room/RoomJoiner";
import { Auth, User } from "@firebase/auth";
import { auth } from "@/service/firebase";
import { RoomSocketService } from "@/service/RoomSocketService";

describe("RoomStore.onJoined", () => {
  it("should set state to JOINED", () => {
    // given
    const roomStore = new RoomStore();

    // when
    roomStore.onJoined([], new Date().toISOString(), mock(), mock());

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
      blacklist: [],
      hasPassword: false,
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

describe("RoomStore.enabledJoinRoomButton", () => {
  it("true", () => {
    // given
    const id = "id";
    const mockAuth = mock<Auth>();
    const mockUser = mock<User>();
    when(mockUser.uid).thenReturn(id);
    when(mockAuth.currentUser).thenReturn(instance(mockUser));
    const roomStore = new RoomStore(new MediaUtil(), instance(mockAuth));

    // when
    roomStore.onConnectedWaitingRoom({
      joinerList: [],
      masterId: "masterId",
      capacity: MAX_ROOM_CAPACITY,
      blacklist: [],
      hasPassword: false,
    });

    // then
    expect(roomStore.enableJoinButton).toBe(true);
  });

  it("should be false when current user already joined room", () => {
    // given
    const id = "id";
    const mockAuth = mock<Auth>();
    const mockUser = mock<User>();
    when(mockUser.uid).thenReturn(id);
    when(mockAuth.currentUser).thenReturn(instance(mockUser));
    const roomStore = new RoomStore(new MediaUtil(), instance(mockAuth));

    // when
    roomStore.onConnectedWaitingRoom({
      joinerList: [{ id: id, name: "name" }],
      masterId: "masterId",
      capacity: MAX_ROOM_CAPACITY,
      blacklist: [],
      hasPassword: false,
    });

    // then
    expect(roomStore.enableJoinButton).toBe(false);
  });

  it("should be false when current user was blocked", () => {
    // given
    const id = "id";
    const mockAuth = mock<Auth>();
    const mockUser = mock<User>();
    when(mockUser.uid).thenReturn(id);
    when(mockAuth.currentUser).thenReturn(instance(mockUser));
    const roomStore = new RoomStore(new MediaUtil(), instance(mockAuth));

    // when
    roomStore.onConnectedWaitingRoom({
      joinerList: [],
      masterId: "masterId",
      capacity: MAX_ROOM_CAPACITY,
      blacklist: [{ id, name: "name" }],
      hasPassword: false,
    });

    // then
    expect(roomStore.enableJoinButton).toBe(false);
  });
});

describe("RoomStore.onFailedToJoin", () => {
  it("should update failedToJoinMessage", () => {
    const roomStore = new RoomStore();
    const message = "message";
    expect(roomStore.failedToJoinMessage).toBeUndefined();

    roomStore.onFailedToJoin(message);

    expect(roomStore.failedToJoinMessage).toBe(message);
  });

  it("should clear passwordInput", () => {
    const roomStore = new RoomStore();
    const passwordInput = "password";
    roomStore.updatePasswordInput(passwordInput);
    expect(roomStore.passwordInput).toBe(passwordInput);

    roomStore.onFailedToJoin("message");

    expect(roomStore.passwordInput).toBe("");
  });
});

describe("RoomStore.onKicked", () => {
  it("should set kicked to true when kicked user is me", () => {
    // given
    const uid = "uid";
    const mockAuth = mock<Auth>();
    const mockUser = mock<User>();
    when(mockUser.uid).thenReturn(uid);
    when(mockAuth.currentUser).thenReturn(instance(mockUser));
    const roomStore = new RoomStore(new MediaUtil(), instance(mockAuth));
    expect(roomStore.kicked).toBe(false);

    // when
    roomStore.onKicked(uid);

    expect(roomStore.kicked).toBe(true);
  });

  it("should not set kicked to true when kicked user is other", () => {
    // given
    const mockAuth = mock<Auth>();
    const mockUser = mock<User>();
    when(mockUser.uid).thenReturn("uid");
    when(mockAuth.currentUser).thenReturn(instance(mockUser));
    const roomStore = new RoomStore(new MediaUtil(), instance(mockAuth));
    roomStore.onChangePeerState({
      uid: "other",
      name: "name",
      enabledMicrophone: true,
      enabledHeadset: true,
    });
    expect(roomStore.kicked).toBe(false);

    // when
    roomStore.onKicked("other");

    expect(roomStore.kicked).toBe(false);
  });
});

describe("RoomStore.unblockUser", () => {
  it("should remove user from blacklist when success", async () => {
    // given
    const userId = "userId";
    const mockService = mock<RoomSocketService>();
    when(mockService.unblockUser(userId)).thenResolve();
    const roomStore = new RoomStore(
      new MediaUtil(),
      auth,
      instance(mockService)
    );
    roomStore.onConnectedWaitingRoom({
      blacklist: [{ id: userId, name: "name" }],
      capacity: 0,
      hasPassword: false,
      joinerList: [],
      masterId: "",
    });

    // when
    await roomStore.unblockUser(userId);

    // then
    expect(roomStore.blacklist.length).toBe(0);
  });
});

export {};
