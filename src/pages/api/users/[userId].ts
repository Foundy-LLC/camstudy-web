import { NextApiRequest, NextApiResponse } from "next";
import { updateUser, getUser } from "@/controller/user.controller";

export default async function userInformationHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "GET":
      await getUser(req, res);
      break;
    case "PATCH":
      await updateUser(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
