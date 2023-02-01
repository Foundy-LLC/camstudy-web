import {
  NO_NAME_ERROR_MESSAGE,
  NO_TAG_ERROR_MESSAGE,
} from "@/constants/message";

export class UserCreateBody {
  constructor(
    readonly uid: string,
    readonly name: string,
    readonly introduce: string | undefined,
    readonly tags: string[]
  ) {
    this.validateName(name);
    this.validateTags(tags);
    this.tags = this.filterNotEmptyTags(tags);
  }

  private validateName = (name: string) => {
    if (name === undefined || name === null) {
      throw NO_NAME_ERROR_MESSAGE;
    }
  };

  private validateTags = (tags: string[]) => {
    if (tags === undefined || tags === null || tags.length === 0) {
      throw NO_TAG_ERROR_MESSAGE;
    }
  };

  private filterNotEmptyTags = (tags: string[]) => {
    return tags.filter((tag) => tag.trim().length > 0);
  };
}
