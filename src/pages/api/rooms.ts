import { NextApiRequest, NextApiResponse } from "next";
import { getRooms, postRoom } from "@/controller/room.controller";
import { util } from "protobufjs";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "GET":
      await getRooms(req, res);
      break;
    case "POST":
      await postRoom(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
