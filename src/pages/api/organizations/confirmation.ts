import { NextApiRequest, NextApiResponse } from "next";
import { confirmOrganizationEmail } from "@/controller/organization.controller";

export default async function emailConfirmationHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "POST":
      await confirmOrganizationEmail(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
