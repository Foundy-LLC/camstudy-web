import { NextApiRequest, NextApiResponse } from "next";
import { FriendPostRequestBody } from "@/models/friend/FriendPostRequestBody";
import { AddFriend } from "@/repository/friend.repository";

export const sendFriendRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userName, userId } = req.body;
  const friendRequestBody = new FriendPostRequestBody(userName, userId);
  await AddFriend(friendRequestBody.userName, friendRequestBody.userId);
};
