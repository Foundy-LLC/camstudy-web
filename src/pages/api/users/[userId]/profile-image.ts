import { NextApiRequest, NextApiResponse } from "next";
import {
  postProfileImage,
  removeUserProfileImage,
} from "@/controller/user.controller";

export default async function profileImageHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "POST":
      await postProfileImage(req, res);
      break;
    case "DELETE":
      await removeUserProfileImage(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
export const config = {
  api: {
    bodyParser: false,
  },
};
