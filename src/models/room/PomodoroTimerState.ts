// TODO: 웹소켓 서버랑 같이 쓰이는 클래스임 때문에 한군데다 모으고 동시에 쓰는 방법을 찾아야함
export enum PomodoroTimerState {
  STOPPED = "stopped",
  STARTED = "started",
  SHORT_BREAK = "shortBreak",
  LONG_BREAK = "longBreak",
}
