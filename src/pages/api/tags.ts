import { NextApiRequest, NextApiResponse } from "next";
import { getTags } from "@/controller/tag.controller";

export default async function tagHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "GET":
      await getTags(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
