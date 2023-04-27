import { ValidateRankOrganizationId } from "@/utils/rank.validator";
import {
  IS_WEEKLY_TYPE_ERROR,
  PAGENATION_NUM_TYPE_ERROR,
} from "@/constants/rankMessage";
import { validateUid } from "@/utils/user.validator";

export class UserRankGetRequestBody {
  constructor(
    readonly userId: string,
    readonly organizationId: string | undefined,
    readonly isWeeklyRank: boolean
  ) {
    validateUid(userId);
    if (this.organizationId !== undefined) {
      ValidateRankOrganizationId(this.organizationId);
    }
    if (isWeeklyRank === undefined) throw IS_WEEKLY_TYPE_ERROR;
  }
}
