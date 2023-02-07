import {
  POMODORO_LONG_BREAK_RANGE,
  POMODORO_LONG_INTERVAL_RANGE,
  POMODORO_SHORT_BREAK_RANGE,
  POMODORO_TIMER_RANGE,
} from "@/constants/room.constant";

export const validateTimerLength = (timerLengthMinutes: number) => {
  if (!POMODORO_TIMER_RANGE.isInRange(timerLengthMinutes)) {
    throw `타이버의 길이는 ${POMODORO_TIMER_RANGE}분 사이만 가능합니다.`;
  }
};

export const validateShortBreak = (shortBreakMinutes: number) => {
  if (!POMODORO_SHORT_BREAK_RANGE.isInRange(shortBreakMinutes)) {
    throw `짧은 휴식의 길이는 ${POMODORO_SHORT_BREAK_RANGE}분 사이만 가능합니다.`;
  }
};

export const validateLongBreak = (longBreakMinutes: number) => {
  if (!POMODORO_LONG_BREAK_RANGE.isInRange(longBreakMinutes)) {
    throw `긴 휴식의 길이는 ${POMODORO_LONG_BREAK_RANGE}분 사이만 가능합니다.`;
  }
};

export const validateLongInterval = (longBreakInterval: number) => {
  if (!POMODORO_LONG_INTERVAL_RANGE.isInRange(longBreakInterval)) {
    throw `긴 휴식 주기는 ${POMODORO_LONG_INTERVAL_RANGE}회 사이만 가능합니다.`;
  }
};
