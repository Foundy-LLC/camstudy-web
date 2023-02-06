import {
  NO_ROOM_EXPIRED_AT_ERROR_MESSAGE,
  NO_ROOM_ID_ERROR_MESSAGE,
  NO_ROOM_LONG_BREAK_ERROR_MESSAGE,
  NO_ROOM_LONG_BREAK_INTERVAL_ERROR_MESSAGE,
  NO_ROOM_SHORT_BREAK_ERROR_MESSAGE,
  NO_ROOM_TIMER_ERROR_MESSAGE,
  NO_ROOM_TITLE_ERROR_MESSAGE,
  NO_ROOM_MASTER_ID_ERROR_MESSAGE,
  ROOM_PAGE_NUM_TYPE_ERROR,
  ROOM_PASSWORD_LENGTH_ERROR_MESSAGE,
  STUDYING_TIME_RANGE_ERROR,
  SHORT_STUDYING_TIME_RANGE_ERROR, LONG_STUDYING_TIME_RANGE_ERROR, BREAK_TIME_INTERVAL_RANGE_ERROR,
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
  if (typeof password !== 'undefined') {
    if (password.length <= 4) {
      throw ROOM_PASSWORD_LENGTH_ERROR_MESSAGE;
    }
  }
};

export const validateTitle = (title: string) => {
  if (title == null) {
    throw NO_ROOM_TITLE_ERROR_MESSAGE;
  }
};
export const validateTimer = (timer: number) => {
  if (timer <20 && timer >50) {
    throw STUDYING_TIME_RANGE_ERROR;
  }
};
export const validateShortBreak = (short_break: number) => {
  if (short_break <3 && short_break >10) {
    throw SHORT_STUDYING_TIME_RANGE_ERROR;
  }
};
export const validateLongBreak = (long_break: number) => {
  if (long_break <10 && long_break >30) {
    throw LONG_STUDYING_TIME_RANGE_ERROR;
  }
};
export const validateLongBreakInterval = (long_break_interval: number) => {
  if (long_break_interval <2 && long_break_interval >6) {
    throw BREAK_TIME_INTERVAL_RANGE_ERROR;
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
