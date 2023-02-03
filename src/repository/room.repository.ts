import prisma from "../../prisma/client";
import { room } from "@prisma/client";
import { MAX_ROOM_PEOPLE_NUMBER } from "@/constants/room.constant";
import client from "prisma/client";
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
}

export const FindRooms = async (pageNum: number) => {
  const rooms = await client.room.findMany({
    skip: pageNum * ROOM_NUM_PER_PAGE,
    take: ROOM_NUM_PER_PAGE,
  });
  return rooms;
  // if (rooms.length === 0)
  //   return res.status(404).end("더 이상 공부방이 존재하지 않습니다.");
  // else return res.status(200).json(rooms);
};
