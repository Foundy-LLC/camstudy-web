import { NextApiRequest, NextApiResponse } from "next";
import { FriendPostRequestBody } from "@/models/friend/FriendPostRequestBody";
import { addFriend, deleteFriendRequest } from "@/repository/friend.repository";
import { ResponseBody } from "@/models/common/ResponseBody";
import { SERVER_INTERNAL_ERROR_MESSAGE } from "@/constants/message";
import {
  FRIEND_CANCEL_REQUEST_ID_ERROR,
  FRIEND_REQUEST_CANCEL_SUCCESS,
  FRIEND_REQUEST_DUPLICATED_ERROR,
  FRIEND_REQUEST_ID_ERROR,
  FRIEND_REQUEST_SUCCESS,
  NOT_FOUND_FRIEND_REQUEST_ERROR,
} from "@/constants/FriendMessage";
import { Prisma } from ".prisma/client";
import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;

export const sendFriendRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, targetUserId } = req.body;
  try {
    const friendRequestBody = new FriendPostRequestBody(userId, targetUserId);
    if (userId === targetUserId) {
      throw FRIEND_REQUEST_ID_ERROR;
    }
    await addFriend(friendRequestBody.userId, friendRequestBody.targetUserId);
    res.status(201).send(new ResponseBody({ message: FRIEND_REQUEST_SUCCESS }));
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    //이미 해당 아이디로 친구 요청을 보낸 적이 있는 경우
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
      res
        .status(409)
        .send(new ResponseBody({ message: FRIEND_REQUEST_DUPLICATED_ERROR }));
      return;
    }
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
  }
};

export const cancelFriendRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId, targetUserId } = req.body;
    const friendRequestBody = new FriendPostRequestBody(userId, targetUserId);
    if (userId === targetUserId) {
      throw FRIEND_CANCEL_REQUEST_ID_ERROR;
    }
    await deleteFriendRequest(
      friendRequestBody.userId,
      friendRequestBody.targetUserId
    );
    res
      .status(201)
      .send(new ResponseBody({ message: FRIEND_REQUEST_CANCEL_SUCCESS }));
  } catch (e) {
    console.error(e);
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
      res
        .status(400)
        .send(new ResponseBody({ message: NOT_FOUND_FRIEND_REQUEST_ERROR }));
      return;
    }
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
  }
};
