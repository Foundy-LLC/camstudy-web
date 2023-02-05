import { NextApiRequest, NextApiResponse } from "next";
import { getRoomAvailability } from "@/controller/room.controller";

export default async function availabilityHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  console.log("availability: ", req);

  switch (method) {
    case "GET":
      await getRoomAvailability(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
