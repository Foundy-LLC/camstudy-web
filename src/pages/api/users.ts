import { NextApiRequest, NextApiResponse } from "next";
import { GetUsers, postUser } from "@/controller/user.controller";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  console.log(req.body);

  switch (method) {
    case "GET":
      await GetUsers(req, res);
      break;
    case "POST":
      await postUser(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
