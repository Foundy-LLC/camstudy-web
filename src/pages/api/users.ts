import { NextApiRequest, NextApiResponse } from "next";
import { postUser } from "@/controller/user.controller";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  console.log(req.body);

  switch (method) {
    case "POST":
      await postUser(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
