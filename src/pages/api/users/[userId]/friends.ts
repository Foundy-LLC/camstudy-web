import { NextApiRequest, NextApiResponse } from "next";
import {
  deleteFriend,
  getFriendList,
  sendFriendRequest,
} from "@/controller/friend.controller";

export default async function friendHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "GET":
      await getFriendList(req, res);
      break;
    case "POST":
      await sendFriendRequest(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
