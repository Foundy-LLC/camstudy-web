import { MAX_REPORT_CONTENT_LENGTH } from "@/constants/report.constant";
import { EXCEED_REPORT_CONTENT_LENGTH_MESSAGE } from "@/constants/message";

export const validateReportContent = (content: string) => {
  if (content.length > MAX_REPORT_CONTENT_LENGTH) {
    throw EXCEED_REPORT_CONTENT_LENGTH_MESSAGE;
  }
};
