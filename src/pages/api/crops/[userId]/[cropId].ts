import { NextApiRequest, NextApiResponse } from "next";
import {
  deleteGrowingCrop,
  harvestGrowingCrop,
} from "@/controller/crop.controller";

export default async function cropsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "DELETE":
      await deleteGrowingCrop(req, res);
      break;
    case "PATCH":
      await harvestGrowingCrop(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
