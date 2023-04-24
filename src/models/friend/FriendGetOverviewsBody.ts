import { validateUid } from "@/utils/user.validator";

export class FriendGetOverviewsBody {
  readonly page: number;

  constructor(readonly userId: string, page: string | undefined) {
    page ??= "0";
    this.page = parseInt(page);

    validateUid(userId);
  }
}
