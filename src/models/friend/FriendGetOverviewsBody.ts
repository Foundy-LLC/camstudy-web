import { validateUid } from "@/utils/user.validator";
import { validatePage, validatePageNum } from "@/utils/rooms.validator";
import {
  validateAccepted,
  validateAcceptedBoolean,
} from "@/utils/friend.validator";

export class FriendGetOverviewsBody {
  readonly page: number;

  constructor(readonly userId: string, page: string | undefined) {
    page ??= "0";
    this.page = parseInt(page);

    validateUid(userId);
  }
}
