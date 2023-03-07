import { NextApiRequest, NextApiResponse } from "next";
import { FriendPostRequestBody } from "@/models/friend/FriendPostRequestBody";
import { AddFriend } from "@/repository/friend.repository";
import { findUser } from "@/repository/user.repository";
import { ResponseBody } from "@/models/common/ResponseBody";
import { SERVER_INTERNAL_ERROR_MESSAGE } from "@/constants/message";
import { FRIEND_REQUEST_DUPLICATED_ERROR } from "@/constants/FriendMessage";
import { Prisma } from ".prisma/client";
import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;

export const sendFriendRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, targetUserId } = req.body;
  try {
    const friendRequestBody = new FriendPostRequestBody(userId, targetUserId);
    await AddFriend(friendRequestBody.userId, friendRequestBody.targetUserId);
    res
      .status(201)
      .send(
        new ResponseBody({ message: "친구 요청을 성공적으로 보냈습니다." })
      );
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
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
