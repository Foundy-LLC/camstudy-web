import {
  NO_TAG_ERROR_MESSAGE,
  NO_USER_NAME_ERROR_MESSAGE,
  NO_USER_UID_ERROR_MESSAGE,
  PROFILE_IMAGE_INVALID_EXTENSION,
  IMAGE_SIZE_EXCEED_MESSAGE,
  TAG_COUNT_ERROR_MESSAGE,
  TAG_LENGTH_ERROR_MESSAGE,
  USER_INTRODUCE_LENGTH_ERROR_MESSAGE,
  USER_NAME_LENGTH_ERROR_MESSAGE,
} from "@/constants/message";
import {
  USER_INTRODUCE_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USER_TAG_MAX_COUNT,
  USER_TAG_MAX_LENGTH,
} from "@/constants/user.constant";
import {
  ALLOWED_EXTENSIONS,
  MAX_IMAGE_BYTE_SIZE,
} from "@/constants/image.constant";

export const validateUserProfileImage = (file: File) => {
  if (!ALLOWED_EXTENSIONS.exec(file.name)) {
    throw PROFILE_IMAGE_INVALID_EXTENSION;
  }
  if (file.size >= MAX_IMAGE_BYTE_SIZE) {
    throw IMAGE_SIZE_EXCEED_MESSAGE;
  }
};

export const validateUid = (userId: string) => {
  if (userId == null) {
    throw NO_USER_UID_ERROR_MESSAGE;
  }
};

export const validateUserName = (name: string) => {
  if (name == null) {
    throw NO_USER_NAME_ERROR_MESSAGE;
  }
  if (
    name.length < USER_NAME_MIN_LENGTH ||
    name.length > USER_NAME_MAX_LENGTH
  ) {
    throw USER_NAME_LENGTH_ERROR_MESSAGE;
  }
};

export const validateUserIntroduce = (introduce: string | null) => {
  if (introduce != null && introduce.length > USER_INTRODUCE_MAX_LENGTH) {
    throw USER_INTRODUCE_LENGTH_ERROR_MESSAGE;
  }
};

export const validateUserTags = (tags: string[]) => {
  if (tags == null || tags.length === 0) {
    throw NO_TAG_ERROR_MESSAGE;
  }
  if (tags.length > USER_TAG_MAX_COUNT) {
    throw TAG_COUNT_ERROR_MESSAGE;
  }
  for (const tag of tags) {
    if (tag.length > USER_TAG_MAX_LENGTH) {
      throw TAG_LENGTH_ERROR_MESSAGE;
    }
  }
};
