import { NextApiRequest, NextApiResponse } from "next";
import { postProfileImage } from "@/controller/user.controller";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "POST":
      await postProfileImage(req, res);
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
