import { NextApiRequest, NextApiResponse } from "next";
import client from "prisma/client";
import { json } from "stream/consumers";
import { string } from "prop-types";
import { getRoom, postRoom } from "@/controller/room.controller";
import { util } from "protobufjs";
import resolve = util.path.resolve;

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body, method, query } = req;
  switch (method) {
    case "GET":
      await getRoom(req, res);
      break;
    case "POST":
      await postRoom(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
