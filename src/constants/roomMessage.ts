import {
  POMODORO_LONG_BREAK_RANGE,
  POMODORO_LONG_INTERVAL_RANGE,
  POMODORO_SHORT_BREAK_RANGE,
  POMODORO_TIMER_RANGE,
} from "@/constants/room.constant";

export const ROOM_CREATE_SUCCESS: string = "방 개설을 성공했습니다.";
export const ROOM_CREATE_FAILED: string = "방 생성에 실패하였습니다";
export const GET_ROOMS_FAILED: string = "방 조회에 실패하였습니다";
export const ROOM_PASSWORD_LENGTH_ERROR_MESSAGE: string =
  "비밀번호는 4자 이상으로 설정해야 합니다.";
export const STUDYING_TIME_RANGE_ERROR: string = `공부 시간은 ${POMODORO_TIMER_RANGE}분으로만 설정할 수 있습니다.`;
export const SHORT_STUDYING_TIME_RANGE_ERROR: string = `짧은 쉬는 시간은 ${POMODORO_SHORT_BREAK_RANGE}분 범위로만 설정할 수 있습니다.`;
export const LONG_STUDYING_TIME_RANGE_ERROR: string = `긴 쉬는 시간은 ${POMODORO_LONG_BREAK_RANGE}분으로만 설정할 수 있습니다.`;
export const BREAK_TIME_INTERVAL_RANGE_ERROR: string = `쉬는 시간 인터벌은 ${POMODORO_LONG_INTERVAL_RANGE}회로만 설정할 수 있습니다.`;

export const ROOM_IS_FULL_MESSAGE: string = "방 정원이 가득 찼습니다.";
export const CONNECTING_ROOM_MESSAGE: string = "연결 중...";
export const ALREADY_JOINED_ROOM_MESSAGE: string =
  "이미 해당 방에 접속해 있습니다.";
export const BLACKLIST_CANNOT_JOIN_ROOM_MESSAGE: string =
  "방 접근이 차단되어 입장할 수 없습니다.";

export const NO_ROOM_ID_ERROR_MESSAGE: string = "방 아이디가 누락 되었습니다";
export const NO_ROOM_MASTER_ID_ERROR_MESSAGE: string =
  "방장 아이디가 누락 되었습니다";
export const NO_ROOM_TITLE_ERROR_MESSAGE: string =
  "방 제목이 입력되지 않았습니다";
export const NO_ROOM_TIMER_ERROR_MESSAGE: string =
  "타이머 값이 입력되지 않았습니다";
export const NO_ROOM_SHORT_BREAK_ERROR_MESSAGE: string =
  "짧은 쉬는 시간이 입력되지 않았습니다";
export const NO_ROOM_LONG_BREAK_ERROR_MESSAGE: string =
  "긴 쉬는 시간이 입력되지 않았습니다";
export const NO_ROOM_LONG_BREAK_INTERVAL_ERROR_MESSAGE: string =
  "긴 쉬는 시간 인터벌이 입력되지 않았습니다";
export const NO_ROOM_EXPIRED_AT_ERROR_MESSAGE: string =
  "방의 유효 기간이 입력되지 않았습니다";
export const ROOM_PAGE_NUM_TYPE_ERROR: string = "잘못된 페이지네이션 값입니다";
export const ROOM_PAGE_OVER_ERROR: string =
  "더이상 공부방이 존재하지 않습니다.";
