import {NO_USER_UID_ERROR_MESSAGE} from "@/constants/message";
import {validateUserIntroduce, validateUserName, validateUserTags,} from "@/utils/user.validator";

// TODO: CreateUserRequestBody 로 이름 바꾸기
export class UserPostRequestBody {
  constructor(
    readonly userId: string,
    readonly name: string,
    readonly introduce: string | undefined,
    readonly tags: string[],
    readonly profileImageUrl: string | undefined
  ) {
    this._validateUid();
    this._validateName();
    this._validateIntroduce();
    this.tags = this._filterNotEmptyTags(this.tags);
    this.tags = this._filterDuplicatedTags(this.tags);
    this._validateTags();
  }

  private _validateUid = () => {
    if (this.userId == null) {
      throw NO_USER_UID_ERROR_MESSAGE;
    }
  };

  private _validateName = () => {
    validateUserName(this.name);
  };

  private _validateIntroduce = () => {
    validateUserIntroduce(this.introduce);
  };

  private _validateTags = () => {
    validateUserTags(this.tags);
  };

  private _filterNotEmptyTags = (tags: string[]): string[] => {
    return tags?.filter((tag) => tag.trim().length > 0);
  };

  private _filterDuplicatedTags = (tags: string[]): string[] => {
    return [...new Set(tags)];
  };
}
