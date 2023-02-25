import { NextApiRequest, NextApiResponse } from "next";
import {
  getBelongOrganizations,
  getOrganizations,
} from "@/controller/organization.controller";

export default async function belongOrganizationHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "GET":
      await getBelongOrganizations(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
