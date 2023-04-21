import { NextApiRequest, NextApiResponse } from "next";
import { fetchHarvestedCrops } from "@/controller/crop.controller";

export default async function cropsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "GET":
      await fetchHarvestedCrops(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
