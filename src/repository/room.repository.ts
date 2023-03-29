import prisma from "../../prisma/client";
import client from "prisma/client";
import { RoomOverview } from "@/models/room/RoomOverview";
import { RoomCreateRequestBody } from "@/models/room/RoomCreateRequestBody";
import { Room } from "@/stores/RoomListStore";
import {
  MAX_RECENT_ROOM_NUM,
  MAX_ROOM_CAPACITY,
  ROOM_NUM_PER_PAGE,
} from "@/constants/room.constant";
import { room } from "@prisma/client";
import { RoomDeleteRequestBody } from "@/models/room/RoomDeleteRequestBody";
import { UserStatus } from "@/models/user/UserStatus";

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
  const rooms = await client.room.findMany({
    where: { deleted_at: null },
    skip: pageNum * ROOM_NUM_PER_PAGE,
    take: ROOM_NUM_PER_PAGE,
    include: {
      study_history: {
        where: {
          exit_at: null,
        },
        include: { user_account: true },
      },
      room_tag: { include: { tag: true } },
    },
  });
  return rooms.map((room) => {
    const userOverviews = room.study_history.map((history) => {
      const { id, name, profile_image, score, status, introduce } =
        history.user_account;
      return {
        id: id,
        name: name,
        profileImage: profile_image,
        rankingScore: Number(score),
        introduce: introduce,
        status: status === "login" ? UserStatus.LOGIN : UserStatus.LOGOUT,
      };
    });
    return new RoomOverview(
      room.id,
      room.master_id,
      room.title,
      room.password ? true : false,
      room.thumbnail,
      room.study_history.length,
      MAX_ROOM_CAPACITY,
      userOverviews,
      room.room_tag.map((tags) => tags.tag.name) //room.room_tags
    );
  });
};

export const findRecentRooms = async (userId: string) => {
  const rooms = await client.study_history.findMany({
    where: { user_id: userId, room: { deleted_at: null } },
    distinct: "room_id",
    take: MAX_RECENT_ROOM_NUM,
    orderBy: { join_at: "desc" },
    include: {
      room: { include: { study_history: { where: { exit_at: null } } } },
    },
  });
  return rooms.map((rooms) => {
    return new RoomOverview(
      rooms.room.id,
      rooms.room.master_id,
      rooms.room.title,
      rooms.room.password ? true : false,
      rooms.room.thumbnail,
      rooms.room.study_history.length,
      MAX_ROOM_CAPACITY,
      [] //room.room_tags
    );
  });
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
