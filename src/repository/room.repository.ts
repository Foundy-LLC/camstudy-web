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

export const findRooms = async (pageNum: number): Promise<Room[]> => {
  var rooms: Room[] = [];
  const result = await client.room.findMany({
    skip: pageNum * ROOM_NUM_PER_PAGE,
    take: ROOM_NUM_PER_PAGE,
  });
  result.map((room) => {
    const newRoom = new Room();
    newRoom.set_room(room.id,
        room.master_id,
        room.title,
        room.thumbnail ? room.thumbnail : undefined,
        room.password ? room.password : undefined,
        room.timer,
        room.short_break,
        room.long_break,
        room.long_break_interval,
        room.expired_at.toString())
    rooms.push(newRoom);
  });
  return rooms;
};

export const createRoom = () => {
  const room = await client.room.create({
    data: {
      id: body.id,
      master_id: body.master_id,
      title: body.title,
      thumbnail: body.thumbnail ? body.thumbnail : ,
      password: body.password ? body.password : null,
      timer: body.timer,
      short_break: body.short_break,
      long_break: body.long_break,
      long_break_interval: body.long_break_interval,
      expired_at: body.expired_at,
    },
  });
};
