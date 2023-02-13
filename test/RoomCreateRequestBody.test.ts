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

const RequestBodyTest = (room: Room) => {
  try {
    new RoomCreateRequestBody(room);
  } catch (e) {
    return e;
  }
  return "No error";
};

describe("RoomCreateRequestBody success validation", () => {
  it("success", () => {
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
    const errorMessage = RequestBodyTest(room);
    //then
    expect(errorMessage).toBe("No error");
  });

  it("should success even if thumbnail and password are undefined", () => {
    const room: Room = new Room(
      "id",
      "masterid",
      "title",
      undefined,
      undefined
    );
    //when
    const errorMessage = RequestBodyTest(room);
    //then
    expect(errorMessage).toBe("No error");
  });
});

describe("RoomCreateRequestBody Error validation", () => {
  it("should throw error when roomId is null", () => {
    //given
    const room: Room = new Room("");
    //when
    const errorMessage = RequestBodyTest(room);
    //then
    expect(errorMessage).toBe(NO_ROOM_ID_ERROR_MESSAGE);
  });

  it("should throw error when masterId is null", () => {
    //given
    const room: Room = new Room("123", "");
    //when
    const errorMessage = RequestBodyTest(room);
    //then
    expect(errorMessage).toBe(NO_ROOM_MASTER_ID_ERROR_MESSAGE);
  });

  it("should throw error when title is null", () => {
    //given
    const room: Room = new Room("123", "123", "");
    //when
    const errorMessage = RequestBodyTest(room);
    //then
    expect(errorMessage).toBe(NO_ROOM_TITLE_ERROR_MESSAGE);
  });

  it("should throw error when password is shorter than 4", () => {
    //given
    const room: Room = new Room("123", "123", "title", "thumbnail", "123");
    //when
    const errorMessage = RequestBodyTest(room);
    //then
    expect(errorMessage).toBe(ROOM_PASSWORD_LENGTH_ERROR_MESSAGE);
  });

  it("should throw error when timer is out of rance", async () => {
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
    const errorMessage = RequestBodyTest(room);
    //then
    expect(errorMessage).toBe(
      `타이머의 길이는 ${POMODORO_TIMER_RANGE}분 사이만 가능합니다.`
    );
  });

  it("should throw error when short-breaktime is out of range", () => {
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
    const errorMessage = RequestBodyTest(room);
    //then
    expect(errorMessage).toBe(
      `짧은 휴식의 길이는 ${POMODORO_SHORT_BREAK_RANGE}분 사이만 가능합니다.`
    );
  });

  it("should throw error when Long-breaktime is out of range", () => {
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
    const errorMessage = RequestBodyTest(room);
    //then
    expect(errorMessage).toBe(
      `긴 휴식의 길이는 ${POMODORO_LONG_BREAK_RANGE}분 사이만 가능합니다.`
    );
  });

  it("should throw error when Long-breaktime is out of range", () => {
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
    const errorMessage = RequestBodyTest(room);
    //then
    expect(errorMessage).toBe(
      `긴 휴식 주기는 ${POMODORO_LONG_INTERVAL_RANGE}회 사이만 가능합니다.`
    );
  });

  it("should throw error when ExpiredAt is null", () => {
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
    const errorMessage = RequestBodyTest(room);
    //then
    expect(errorMessage).toBe(NO_ROOM_EXPIRED_AT_ERROR_MESSAGE);
  });
});
