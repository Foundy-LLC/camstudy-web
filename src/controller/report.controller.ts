import { NextApiRequest, NextApiResponse } from "next";
import { ReportPostRequestBody } from "@/models/report/ReportPostRequestBody";
import { ResponseBody } from "@/models/common/ResponseBody";
import {
  NOT_FOUND_REPORTER_MESSAGE,
  NOT_FOUND_SUSPECT_MESSAGE,
  SERVER_INTERNAL_ERROR_MESSAGE,
  SUCCESSFUL_REPORTED_MESSAGE,
} from "@/constants/message";
import { isUserExists } from "@/repository/user.repository";
import { createReport } from "@/repository/report.repository";

export const postReport = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const body = req.body as ReportPostRequestBody;

    const existsReport = await isUserExists(body.reporterId);
    if (!existsReport) {
      res
        .status(404)
        .send(new ResponseBody({ message: NOT_FOUND_REPORTER_MESSAGE }));
      return;
    }

    const existsSuspect = await isUserExists(body.suspectId);
    if (!existsSuspect) {
      res
        .status(404)
        .send(new ResponseBody({ message: NOT_FOUND_SUSPECT_MESSAGE }));
      return;
    }

    await createReport(body);
    res
      .status(201)
      .send(new ResponseBody({ message: SUCCESSFUL_REPORTED_MESSAGE }));
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(e);
      return;
    }
    console.log("POST REPORT INTERNAL ERROR: ", e);
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
  }
};
