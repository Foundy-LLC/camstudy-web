import { NextApiRequest, NextApiResponse } from "next";
import { getUsers, postUser } from "@/controller/user.controller";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      await getUsers(req, res);
      break;
    case "POST":
      await postUser(req, res);
      break;
    default:
      res.status(405).send(`Method ${method} Not Allowed`);
  }
}
