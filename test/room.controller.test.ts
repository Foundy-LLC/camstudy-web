import { mockPrisma } from "./mockPrisma";
import { room } from "@prisma/client";
import { getRoomAvailability } from "@/controller/room.controller";
import { NextApiRequest, NextApiResponse } from "next";
import { instance, mock, verify, when } from "ts-mockito";
import { MAX_ROOM_PEOPLE_NUMBER } from "@/constants/room.constant";

describe("getRoomAvailability", () => {
  const mockRoom: room = {
    expired_at: new Date(),
    id: "id",
    long_break: 0,
    long_break_interval: 0,
    master_id: "",
    password: "1234",
    short_break: 0,
    thumbnail: "url here",
    timer: 0,
    title: "",
  };

  const createMockRequest = ({
    body,
    query,
  }: {
    body?: any;
    query?: any;
  }): NextApiRequest => {
    const request = mock<NextApiRequest>();
    when(request.body).thenReturn(body);
    when(request.query).thenReturn(query);
    return request;
  };

  it("success", async () => {
    // when
    mockPrisma.room.findUnique.mockResolvedValue(mockRoom);
    mockPrisma.study_history.findMany.mockResolvedValue([]);
    mockPrisma.block.findUnique.mockResolvedValue(null);
    const request = createMockRequest({
      body: {
        userId: "uid",
        password: mockRoom.password,
      },
      query: {
        roomId: mockRoom.id,
      },
    });
    const response = mock<NextApiResponse>();
    when(response.status(200)).thenReturn(response);

    // when
    await getRoomAvailability(instance(request), instance(response));

    // then
    expect(true).toBeTruthy();
    verify(response.status(200)).once();
  });

  it("success when user is master even though room is full", async () => {
    // when
    const uid = "uid";
    const room = { ...mockRoom, master_id: uid };
    mockPrisma.room.findUnique.mockResolvedValue(room);
    mockPrisma.study_history.findMany.mockResolvedValue([
      ...Array(MAX_ROOM_PEOPLE_NUMBER),
    ]);
    mockPrisma.block.findUnique.mockResolvedValue(null);
    const request = createMockRequest({
      body: {
        userId: uid,
        password: mockRoom.password,
      },
      query: {
        roomId: mockRoom.id,
      },
    });
    const response = mock<NextApiResponse>();
    when(response.status(200)).thenReturn(response);

    // when
    await getRoomAvailability(instance(request), instance(response));

    // then
    expect(true).toBeTruthy();
    verify(response.status(200)).once();
  });

  it("should return 400 when password is invalid", async () => {
    // when
    mockPrisma.room.findUnique.mockResolvedValue(mockRoom);
    mockPrisma.study_history.findMany.mockResolvedValue([]);
    mockPrisma.block.findUnique.mockResolvedValue(null);
    const request = createMockRequest({
      body: {
        userId: "uid",
        password: "wrong!",
      },
      query: {
        roomId: mockRoom.id,
      },
    });
    const response = mock<NextApiResponse>();
    when(response.status(400)).thenReturn(response);

    // when
    await getRoomAvailability(instance(request), instance(response));

    // then
    expect(true).toBeTruthy();
    verify(response.status(400)).once();
  });

  it("should return 404 when there is no room", async () => {
    // when
    mockPrisma.room.findUnique.mockResolvedValue(null);
    mockPrisma.study_history.findMany.mockResolvedValue([]);
    mockPrisma.block.findUnique.mockResolvedValue(null);
    const request = createMockRequest({
      body: {
        userId: "uid",
        password: mockRoom.password,
      },
      query: {
        roomId: mockRoom.id,
      },
    });
    const response = mock<NextApiResponse>();
    when(response.status(404)).thenReturn(response);

    // when
    await getRoomAvailability(instance(request), instance(response));

    // then
    expect(true).toBeTruthy();
    verify(response.status(404)).once();
  });

  it("should return 400 when room is full", async () => {
    // when
    mockPrisma.room.findUnique.mockResolvedValue(mockRoom);
    mockPrisma.study_history.findMany.mockResolvedValue([
      ...new Array(MAX_ROOM_PEOPLE_NUMBER),
    ]);
    mockPrisma.block.findUnique.mockResolvedValue(null);
    const request = createMockRequest({
      body: {
        userId: "uid",
        password: mockRoom.password,
      },
      query: {
        roomId: mockRoom.id,
      },
    });
    const response = mock<NextApiResponse>();
    when(response.status(400)).thenReturn(response);

    // when
    await getRoomAvailability(instance(request), instance(response));

    // then
    expect(true).toBeTruthy();
    verify(response.status(400)).once();
  });

  it("should return 400 when user was blocked", async () => {
    // when
    const uid = "uid";
    mockPrisma.room.findUnique.mockResolvedValue(mockRoom);
    mockPrisma.study_history.findMany.mockResolvedValue([]);
    mockPrisma.block.findUnique.mockResolvedValue({
      user_id: uid,
      room_id: mockRoom.id,
    });
    const request = createMockRequest({
      body: {
        userId: uid,
        password: mockRoom.password,
      },
      query: {
        roomId: mockRoom.id,
      },
    });
    const response = mock<NextApiResponse>();
    when(response.status(400)).thenReturn(response);

    // when
    await getRoomAvailability(instance(request), instance(response));

    // then
    expect(true).toBeTruthy();
    verify(response.status(400)).once();
  });
});

export {};
