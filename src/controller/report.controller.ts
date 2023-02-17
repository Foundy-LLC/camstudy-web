import { NextApiRequest, NextApiResponse } from "next";
import { ReportPostRequestBody } from "@/models/report/ReportPostRequestBody";
import { ResponseBody } from "@/models/common/ResponseBody";
import {
  NOT_FOUND_REPORTER_MESSAGE,
  NOT_FOUND_SUSPECT_MESSAGE,
  IMAGE_SIZE_EXCEED_MESSAGE,
  REPORT_SCREENSHOT_UPLOADED,
  SERVER_INTERNAL_ERROR_MESSAGE,
  SUCCESSFUL_REPORTED_MESSAGE,
} from "@/constants/message";
import { isUserExists } from "@/repository/user.repository";
import {
  createReport,
  updateReportScreenshot,
} from "@/repository/report.repository";
import { ReportPostResponseBody } from "@/models/report/ReportPostResponseBody";
import multer, { MulterError } from "multer";
import { uuidv4 } from "@firebase/util";
import { multipartUploader } from "@/service/imageUploader";
import runMiddleware from "@/utils/runMiddleware";
import { MAX_IMAGE_BYTE_SIZE } from "@/constants/image.constant";

export const postReport = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody<ReportPostResponseBody>>
) => {
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

    const report = await createReport(body);
    const responseBody: ReportPostResponseBody = { reportId: report.id };
    res.status(201).send(
      new ResponseBody({
        message: SUCCESSFUL_REPORTED_MESSAGE,
        data: responseBody,
      })
    );
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    console.log("POST REPORT INTERNAL ERROR: ", e);
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
  }
};

export const postReportScreenshot = async (
  req: NextApiRequest & { [key: string]: any },
  res: NextApiResponse<ResponseBody<string>>
) => {
  try {
    const reportId = req.query.reportId;
    if (typeof reportId !== "string") {
      res.status(400).send(
        new ResponseBody({
          message: "reportId가 잘못된 접근입니다.",
        })
      );
      return;
    }

    const multerUpload = multer({
      storage: multer.diskStorage({
        destination: function (req, file, callback) {
          callback(null, "uploads/");
        },
        filename: function (req, file, callback) {
          callback(null, uuidv4() + ".png");
        },
      }),
      limits: { fileSize: MAX_IMAGE_BYTE_SIZE },
    });

    await runMiddleware(req, res, multerUpload.single("screenshot"));
    const file = req.file;
    const signedUrl = await multipartUploader(
      "reports/" + reportId + ".png",
      file.path
    );

    await updateReportScreenshot(reportId, signedUrl);

    res.status(201).send(
      new ResponseBody({
        message: REPORT_SCREENSHOT_UPLOADED,
        data: signedUrl,
      })
    );
  } catch (e) {
    if (e instanceof MulterError && e.code === "LIMIT_FILE_SIZE") {
      res
        .status(400)
        .send(new ResponseBody({ message: IMAGE_SIZE_EXCEED_MESSAGE }));
      return;
    }
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    res
      .status(500)
      .end(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
    return;
  }
};
