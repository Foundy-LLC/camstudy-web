import { Room } from "@/stores/RoomListStore";
import expect from "expect";
import {
  NO_ROOM_EXPIRED_AT_ERROR_MESSAGE,
  NO_ROOM_ID_ERROR_MESSAGE,
  NO_ROOM_MASTER_ID_ERROR_MESSAGE,
  NO_ROOM_TITLE_ERROR_MESSAGE,
  ROOM_PASSWORD_LENGTH_ERROR_MESSAGE,
} from "@/constants/roomMessage";
import {
  POMODORO_LONG_BREAK_RANGE,
  POMODORO_LONG_INTERVAL_RANGE,
  POMODORO_SHORT_BREAK_RANGE,
  POMODORO_TIMER_RANGE,
} from "@/constants/room.constant";
import { RoomCreateRequestBody } from "@/models/room/RoomCreateRequestBody";

describe("RoomCreateRequestBody success validation", () => {
  it("success", async () => {
    const room: Room = new Room(
      "id",
      "masterid",
      "title",
      "thumbnail",
      "password",
      30,
      5,
      10,
      2,
      "2021-08-21T12:30:00.000Z",
      []
    );
    //when
    await expect(async () => {
      new RoomCreateRequestBody(room);
    }).not.toThrow(); //then
  });

  it("should success even if thumbnail and password are undefined", async () => {
    const room: Room = new Room(
      "id",
      "masterid",
      "title",
      undefined,
      undefined
    );
    //when
    await expect(async () => {
      await new RoomCreateRequestBody(room);
    }).not.toThrow(); //then
  });
});

describe("RoomCreateRequestBody Error validation", () => {
  it("should throw error when roomId is null", async () => {
    //given
    const room: Room = new Room("");
    //when
    await expect(() => {
      new RoomCreateRequestBody(room);
    }).toThrow(NO_ROOM_ID_ERROR_MESSAGE); //then
  });

  it("should throw error when masterId is null", async () => {
    //given
    const room: Room = new Room("123", "");
    //when
    await expect(() => {
      new RoomCreateRequestBody(room);
    }).toThrow(NO_ROOM_MASTER_ID_ERROR_MESSAGE); //then
  });

  it("should throw error when title is null", async () => {
    //given
    const room: Room = new Room("123", "123", "");
    //when
    await expect(() => {
      new RoomCreateRequestBody(room);
    }).toThrow(NO_ROOM_TITLE_ERROR_MESSAGE); //then
  });

  it("should throw error when password is shorter than 4", async () => {
    //given
    const room: Room = new Room("123", "123", "title", "thumbnail", "123");
    //when
    await expect(() => {
      new RoomCreateRequestBody(room);
    }).toThrow(ROOM_PASSWORD_LENGTH_ERROR_MESSAGE); //then
  });

  it("should throw error when timer is out of range", async () => {
    //given
    const room: Room = new Room(
      "123",
      "123",
      "title",
      "thumbnail",
      "password",
      10
    );
    //when
    await expect(() => {
      new RoomCreateRequestBody(room);
    }).toThrow(`타이머의 길이는 ${POMODORO_TIMER_RANGE}분 사이만 가능합니다.`); //then
  });

  it("should throw error when short-breaktime is out of range", async () => {
    //given
    const room: Room = new Room(
      "123",
      "123",
      "title",
      "thumbnail",
      "password",
      20,
      2
    );
    //when
    await expect(() => {
      new RoomCreateRequestBody(room);
    }).toThrow(
      `짧은 휴식의 길이는 ${POMODORO_SHORT_BREAK_RANGE}분 사이만 가능합니다.`
    ); //then
  });

  it("should throw error when Long-breaktime is out of range", async () => {
    //given
    const room: Room = new Room(
      "123",
      "123",
      "title",
      "thumbnail",
      "password",
      20,
      3,
      5
    );
    //when
    await expect(() => {
      new RoomCreateRequestBody(room);
    }).toThrow(
      `긴 휴식의 길이는 ${POMODORO_LONG_BREAK_RANGE}분 사이만 가능합니다.`
    ); //then
  });

  it("should throw error when Long-breaktime interval is out of range", async () => {
    //given
    const room: Room = new Room(
      "123",
      "123",
      "title",
      "thumbnail",
      "password",
      20,
      3,
      10,
      1
    );
    //when
    await expect(() => {
      new RoomCreateRequestBody(room);
    }).toThrow(
      `긴 휴식 주기는 ${POMODORO_LONG_INTERVAL_RANGE}회 사이만 가능합니다.`
    ); //then
  });

  it("should throw error when ExpiredAt is null", async () => {
    //given
    const room: Room = new Room(
      "123",
      "123",
      "title",
      "thumbnail",
      "password",
      20,
      3,
      10,
      2,
      ""
    );
    //when
    await expect(() => {
      new RoomCreateRequestBody(room);
    }).toThrow(NO_ROOM_EXPIRED_AT_ERROR_MESSAGE); //then
  });
});
