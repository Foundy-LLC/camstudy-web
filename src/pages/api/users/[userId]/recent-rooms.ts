import { NextApiRequest, NextApiResponse } from "next";
import { getRecentRooms, getRooms } from "@/controller/room.controller";

export default async function recentRoomHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      await getRecentRooms(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
