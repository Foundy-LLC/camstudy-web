import { NextApiRequest, NextApiResponse } from "next";
import { getRecommendedFriends } from "@/controller/friend.controller";

export default async function recommendedFriends(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "GET":
      await getRecommendedFriends(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
