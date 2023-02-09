import { NextApiRequest, NextApiResponse } from "next";
import { getUserExistence } from "@/controller/user.controller";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      await getUserExistence(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
