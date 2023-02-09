import { Range } from "@/models/common/Range";

// TODO: socket server와 중복되는 값, 한곳에서 통일 필요
export const MAX_ROOM_CAPACITY = 4;
export const POMODORO_TIMER_RANGE: Range = new Range(20, 50);
export const POMODORO_SHORT_BREAK_RANGE: Range = new Range(3, 10);
export const POMODORO_LONG_BREAK_RANGE: Range = new Range(10, 30);
export const POMODORO_LONG_INTERVAL_RANGE: Range = new Range(2, 6);
