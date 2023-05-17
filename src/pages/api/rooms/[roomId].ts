import { NextApiRequest, NextApiResponse } from "next";
import { deleteRoom, getRoom } from "@/controller/room.controller";

export default async function roomInformationHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      await getRoom(req, res);
      break;
    case "DELETE":
      await deleteRoom(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
