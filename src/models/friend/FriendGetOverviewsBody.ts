import { validateUid } from "@/utils/user.validator";
import { validatePage, validatePageNum } from "@/utils/rooms.validator";
import {
  validateAccepted,
  validateAcceptedBoolean,
} from "@/utils/friend.validator";

export class FriendGetOverviewsBody {
  readonly page: number;
  readonly accepted: boolean;

  constructor(
    readonly userId: string,
    page: string | undefined,
    accepted: string | undefined
  ) {
    page ??= "0";
    accepted ??= "true";
    this.page = parseInt(page);
    this.accepted = Boolean(accepted);

    validateUid(userId);
  }
}
