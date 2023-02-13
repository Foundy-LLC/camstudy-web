import {
  NO_ROOM_EXPIRED_AT_ERROR_MESSAGE,
  NO_ROOM_ID_ERROR_MESSAGE,
  NO_ROOM_MASTER_ID_ERROR_MESSAGE,
  NO_ROOM_TITLE_ERROR_MESSAGE,
  ROOM_PAGE_NUM_TYPE_ERROR,
  ROOM_PASSWORD_LENGTH_ERROR_MESSAGE,
} from "@/constants/roomMessage";

export const validateId = (id: string) => {
  if (id === "") {
    throw NO_ROOM_ID_ERROR_MESSAGE;
  }
};

export const validateMasterId = (master_id: string) => {
  if (master_id == "") {
    throw NO_ROOM_MASTER_ID_ERROR_MESSAGE;
  }
};

export const validateTitle = (title: string) => {
  if (title === "") {
    throw NO_ROOM_TITLE_ERROR_MESSAGE;
  }
};

export const validatePassword = (password: string | undefined) => {
  if (password !== undefined) {
    if (password.length < 4) {
      throw ROOM_PASSWORD_LENGTH_ERROR_MESSAGE;
    }
  }
};

export const validateExpiredAt = (expired_at: string) => {
  if (expired_at === "") {
    throw NO_ROOM_EXPIRED_AT_ERROR_MESSAGE;
  }
};

export const validatePageNum = (page_num: number | null) => {
  if (page_num == null) {
    throw ROOM_PAGE_NUM_TYPE_ERROR;
  }
};
