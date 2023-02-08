import prisma from "../../prisma/client";
import { room } from "@prisma/client";
import { MAX_ROOM_PEOPLE_NUMBER } from "@/constants/room.constant";
import client from "prisma/client";
import { RoomOverview } from "@/models/room/RoomOverview";
import { RoomRequestBody } from "@/models/room/RoomRequestBody";
import { Room } from "@/stores/RoomListStore";

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
  return histories.length === MAX_ROOM_PEOPLE_NUMBER;
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
  const result = await client.room.findMany({
    skip: pageNum * ROOM_NUM_PER_PAGE,
    take: ROOM_NUM_PER_PAGE,
  });
  result.map((room) => {
    const roomOverview = new RoomOverview(
      room.id,
      room.title,
      room.password,
      room.thumbnail,
      // room.joinCount, //TODO 스터디 히스토리 방 id 일치하면서 나간 시간이 없는 사람 갯수
      // room.maxCount,  //TODO MAX_ROOM_PEOPLE_NUMBER
      [] //room.room_tags
    );
    roomOverviews.push(roomOverview);
  });
  return roomOverviews;
};
export const createRoom = async (body: RoomRequestBody) => {
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
