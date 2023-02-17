import { NextApiRequest, NextApiResponse } from "next";
import { postReport } from "@/controller/report.controller";

export default async function reportsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "POST":
      await postReport(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
