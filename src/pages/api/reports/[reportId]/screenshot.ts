import { NextApiRequest, NextApiResponse } from "next";
import { postReportScreenshot } from "@/controller/report.controller";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function reportScreenshotHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "POST":
      await postReportScreenshot(req, res);
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
