import {
  IS_WEEKLY_TYPE_ERROR,
  PAGENATION_NUM_TYPE_ERROR,
} from "@/constants/rankMessage";
import { validateUid } from "@/utils/user.validator";

export class RankGetRequestBody {
  constructor(readonly userId: string, readonly requesterId: string) {
    validateUid(userId);
    validateUid(requesterId);
  }
}
