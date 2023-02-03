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
export const validateTitle = (title: string) => {
  if (title == null) {
    throw NO_ROOM_TITLE_ERROR_MESSAGE;
  }
};
export const validateTimer = (timer: number) => {
  if (timer == null) {
    throw NO_ROOM_TIMER_ERROR_MESSAGE;
  }
};
export const validateShortBreak = (short_break: number) => {
  if (short_break == null) {
    throw NO_ROOM_SHORT_BREAK_ERROR_MESSAGE;
  }
};
export const validateLongBreak = (long_break: number) => {
  if (long_break == null) {
    throw NO_ROOM_LONG_BREAK_ERROR_MESSAGE;
  }
};
export const validateLongBreakInterval = (long_break_interval: number) => {
  if (long_break_interval == null) {
    throw NO_ROOM_LONG_BREAK_INTERVAL_ERROR_MESSAGE;
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
