import { ReportCategory } from "@/models/report/ReportCategory";
import { validateReportContent } from "@/utils/report.validator";

export class ReportPostRequestBody {
  constructor(
    readonly suspectId: string,
    readonly reporterId: string,
    readonly category: ReportCategory,
    readonly content: string,
    readonly screenshot?: string
  ) {
    validateReportContent(content);
  }
}
