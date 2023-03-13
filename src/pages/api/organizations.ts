import { NextApiRequest, NextApiResponse } from "next";
import { getOrganizations } from "@/controller/organization.controller";

export default async function organizationHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "GET":
      await getOrganizations(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
