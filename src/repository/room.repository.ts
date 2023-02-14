import prisma from "../../prisma/client";
import client from "prisma/client";
import { RoomOverview } from "@/models/room/RoomOverview";
import { RoomCreateRequestBody } from "@/models/room/RoomCreateRequestBody";
import { Room } from "@/stores/RoomListStore";
import { MAX_ROOM_CAPACITY } from "@/constants/room.constant";
import { room } from "@prisma/client";
import { RoomDeleteRequestBody } from "@/models/room/RoomDeleteRequestBody";

const ROOM_NUM_PER_PAGE = 30 as const;

export const findRoomById = async (roomId: string): Promise<room | null> => {
  return await prisma.room.findUnique({
    where: {
      id: roomId,
    },
  });
};

export const isRoomFull = async (roomId: string): Promise<boolean> => {
  const histories = await prisma.study_history.findMany({
    where: {
      room_id: roomId,
      exit_at: undefined,
    },
  });
  return histories.length === MAX_ROOM_CAPACITY;
};

export const isUserBlockedAtRoom = async (
  userId: string,
  roomId: string
): Promise<boolean> => {
  const block = await prisma.block.findUnique({
    where: {
      room_id_user_id: {
        room_id: roomId,
        user_id: userId,
      },
    },
  });
  return block != null;
};
export const findRooms = async (pageNum: number): Promise<RoomOverview[]> => {
  //roomOverview를 반환
  var roomOverviews: RoomOverview[] = [];
  const rooms = await client.room.findMany({
    where: { deleted_at: null },
    skip: pageNum * ROOM_NUM_PER_PAGE,
    take: ROOM_NUM_PER_PAGE,
    include: {
      study_history: {
        where: {
          exit_at: null,
        },
      },
    },
  });
  await rooms.map(async (room) => {
    const roomOverview = new RoomOverview(
      room.id,
      room.master_id,
      room.title,
      room.password ? true : false,
      room.thumbnail,
      room.study_history.length,
      MAX_ROOM_CAPACITY,
      [] //room.room_tags
    );
    roomOverviews.push(roomOverview);
  });
  return roomOverviews;
};
export const createRoom = async (body: RoomCreateRequestBody) => {
  const room: Room = body.room;
  await client.room.create({
    data: {
      id: room.id,
      master_id: room.masterId,
      title: room.title,
      thumbnail: room.thumbnail,
      password: room.password,
      timer: room.timer,
      short_break: room.shortBreak,
      long_break: room.longBreak,
      long_break_interval: room.longBreakInterval,
      expired_at: room.expiredAt,
    },
  });
};

export const deleteRoomReq = async (body: RoomDeleteRequestBody) => {
  const roomId: string = body.roomId;
  await client.room.update({
    where: { id: roomId },
    data: { deleted_at: new Date() },
  });
};
