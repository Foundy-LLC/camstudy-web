import { ReportPostRequestBody } from "@/models/report/ReportPostRequestBody";
import prisma from "../../prisma/client";
import { uuidv4 } from "@firebase/util";
import { report } from ".prisma/client";

export const createReport = async (
  body: ReportPostRequestBody
): Promise<report> => {
  return await prisma.report.create({
    data: {
      id: uuidv4(),
      suspect_id: body.suspectId,
      reporter_id: body.reporterId,
      category: body.category,
      content: body.content,
      reported_at: new Date(),
    },
  });
};

export const updateReportScreenshot = async (
  reportId: string,
  screenshot: string
) => {
  await prisma.report.update({
    where: {
      id: reportId,
    },
    data: {
      screenshot: screenshot,
    },
  });
};
