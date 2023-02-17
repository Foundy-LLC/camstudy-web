import { ReportPostRequestBody } from "@/models/report/ReportPostRequestBody";
import prisma from "../../prisma/client";
import { uuidv4 } from "@firebase/util";

export const createReport = async (body: ReportPostRequestBody) => {
  await prisma.report.create({
    data: {
      id: uuidv4(),
      suspect_id: body.suspectId,
      reporter_id: body.reporterId,
      category: body.category,
      content: body.content,
      reported_at: new Date(),
      screenshot: body.screenshot,
    },
  });
};
