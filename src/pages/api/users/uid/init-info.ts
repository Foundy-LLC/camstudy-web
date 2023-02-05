import { NextApiRequest, NextApiResponse } from "next";
import { getUser } from "@/controller/user.controller";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      await getUser(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
