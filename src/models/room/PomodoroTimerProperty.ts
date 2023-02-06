// TODO: webrtc repo에서 중복됨. 하나로 공유할 수 있는 방법을 찾아야함.
export interface PomodoroTimerProperty {
  readonly timerLengthMinutes: number;
  readonly shortBreakMinutes: number;
  readonly longBreakMinutes: number;
  readonly longBreakInterval: number;
}
