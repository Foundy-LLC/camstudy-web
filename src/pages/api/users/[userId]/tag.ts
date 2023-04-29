import { NextApiRequest, NextApiResponse } from "next";
import { deleteTag } from "@/controller/tag.controller";

export default async function tagHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "DELETE":
      await deleteTag(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
