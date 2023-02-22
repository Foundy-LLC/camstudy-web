import { NextApiRequest, NextApiResponse } from "next";
import { setOrganizationEmail } from "@/controller/organization.controller";

export default async function organizationEmailHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "POST":
      await setOrganizationEmail(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
