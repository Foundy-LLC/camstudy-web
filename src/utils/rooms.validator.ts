import {
  BREAK_TIME_INTERVAL_RANGE_ERROR,
  LONG_STUDYING_TIME_RANGE_ERROR,
  NO_ROOM_EXPIRED_AT_ERROR_MESSAGE,
  NO_ROOM_ID_ERROR_MESSAGE,
  NO_ROOM_MASTER_ID_ERROR_MESSAGE,
  NO_ROOM_TITLE_ERROR_MESSAGE,
  ROOM_PAGE_NUM_TYPE_ERROR,
  ROOM_PASSWORD_LENGTH_ERROR_MESSAGE,
  SHORT_STUDYING_TIME_RANGE_ERROR,
  STUDYING_TIME_RANGE_ERROR,
} from "@/constants/roomMessage";

export const validateId = (id: string) => {
  if (id == null) {
    throw NO_ROOM_ID_ERROR_MESSAGE;
  }
};

export const validateMasterId = (master_id: string) => {
  if (master_id == null) {
    throw NO_ROOM_MASTER_ID_ERROR_MESSAGE;
  }
};
export const validateThumbnail = (thumbnail: string | undefined) => {
  if (thumbnail == null) {
    throw NO_ROOM_MASTER_ID_ERROR_MESSAGE;
  }
};
export const validatePassword = (password: string | undefined) => {
  if (typeof password !== "undefined") {
    if (password.length < 4) {
      throw ROOM_PASSWORD_LENGTH_ERROR_MESSAGE;
    }
  }
};

export const validateTitle = (title: string) => {
  if (title == null) {
    throw NO_ROOM_TITLE_ERROR_MESSAGE;
  }
};

export const validateExpiredAt = (expired_at: string) => {
  if (expired_at == null) {
    throw NO_ROOM_EXPIRED_AT_ERROR_MESSAGE;
  }
};

export const validatePageNum = (page_num: number | null) => {
  if (page_num == null) {
    throw ROOM_PAGE_NUM_TYPE_ERROR;
  }
};
