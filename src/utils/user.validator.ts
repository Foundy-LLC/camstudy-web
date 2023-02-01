import {
  USER_INTRODUCE_LENGTH_ERROR_MESSAGE,
  USER_NAME_LENGTH_ERROR_MESSAGE,
  NO_USER_NAME_ERROR_MESSAGE,
  NO_TAG_ERROR_MESSAGE,
  TAG_LENGTH_ERROR_MESSAGE,
} from "@/constants/message";

export const validateUserName = (name: string) => {
  if (name == null) {
    throw NO_USER_NAME_ERROR_MESSAGE;
  }
  if (name.length < 1 || name.length > 20) {
    throw USER_NAME_LENGTH_ERROR_MESSAGE;
  }
};

export const validateUserIntroduce = (introduce: string | undefined) => {
  if (introduce != null && introduce.length > 100) {
    throw USER_INTRODUCE_LENGTH_ERROR_MESSAGE;
  }
};

export const validateUserTags = (tags: string[]) => {
  if (tags == null || tags.length === 0) {
    throw NO_TAG_ERROR_MESSAGE;
  }
  for (const tag of tags) {
    if (tag.length > 20) {
      throw TAG_LENGTH_ERROR_MESSAGE;
    }
  }
};
