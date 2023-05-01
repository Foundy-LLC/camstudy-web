import {
  IS_WEEKLY_TYPE_ERROR,
  PAGENATION_NUM_TYPE_ERROR,
} from "@/constants/rankMessage";

export class RankGetRequestBody {
  constructor(
    readonly organizationId: string | undefined,
    readonly pageNum: number,
    readonly isWeeklyRank: boolean
  ) {
    if (!Number.isInteger(pageNum)) throw PAGENATION_NUM_TYPE_ERROR;
    if (isWeeklyRank === undefined) throw IS_WEEKLY_TYPE_ERROR;
  }
}
