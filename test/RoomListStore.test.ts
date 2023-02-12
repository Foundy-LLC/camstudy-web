import { Room, RoomListStore } from "@/stores/RoomListStore";
import { RoomService } from "@/service/room.service";
import { RootStore } from "@/stores/RootStore";
import expect from "expect";
import {
  NO_ROOM_ID_ERROR_MESSAGE,
  NO_ROOM_MASTER_ID_ERROR_MESSAGE,
  NO_ROOM_TITLE_ERROR_MESSAGE,
  ROOM_PASSWORD_LENGTH_ERROR_MESSAGE,
} from "@/constants/roomMessage";

describe("RoomListStore.createRoom", () => {
  it("should throw error when roomId is null", async () => {
    //given
    const roomService = new RoomService();
    const room: Room = new Room("");
    const roomListStore = new RoomListStore(new RootStore(), roomService, room);

    //when
    await roomListStore.createRoom();

    //then
    expect(roomListStore.errorMessage).toBe(NO_ROOM_ID_ERROR_MESSAGE);
  });

  it("should throw error when masterId is null", async () => {
    //given
    const roomService = new RoomService();
    const room: Room = new Room("123", "");
    const roomListStore = new RoomListStore(new RootStore(), roomService, room);
    //when
    await roomListStore.createRoom();
    //then
    expect(roomListStore.errorMessage).toBe(NO_ROOM_MASTER_ID_ERROR_MESSAGE);
  });

  it("should throw error when title is null", async () => {
    //given
    const roomService = new RoomService();
    const room: Room = new Room("123", "123", "");
    const roomListStore = new RoomListStore(new RootStore(), roomService, room);
    //when
    await roomListStore.createRoom();
    //then
    expect(roomListStore.errorMessage).toBe(NO_ROOM_TITLE_ERROR_MESSAGE);
  });

  // it("should pass when thumbnail and password are undefined", async () => {
  //   //given
  //   const roomService = new RoomService();
  //   const room: Room = new Room("123", "123", "title", undefined, undefined);
  //   const roomListStore = new RoomListStore(new RootStore(), roomService, room);
  //   //when
  //   await roomListStore.createRoom();
  //   //then
  //   expect(roomListStore.errorMessage).toBe("");
  // });

  it("should throw error when password is shorter than 4", async () => {
    //given
    const roomService = new RoomService();
    const room: Room = new Room("123", "123", "title", undefined, "123");
    const roomListStore = new RoomListStore(new RootStore(), roomService, room);
    //when
    await roomListStore.createRoom();
    //then
    expect(roomListStore.errorMessage).toBe(ROOM_PASSWORD_LENGTH_ERROR_MESSAGE);
  });
});
