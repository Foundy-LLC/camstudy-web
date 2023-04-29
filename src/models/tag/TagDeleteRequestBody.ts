import { TAG_NAME_NULL_ERROR } from "@/constants/tag.constant";
import { validateUid } from "@/utils/user.validator";

export class tagDeleteRequestBody {
  constructor(readonly userId: string, readonly tag: string) {
    validateUid(userId);
    if (tag == null) throw TAG_NAME_NULL_ERROR;
  }
}
