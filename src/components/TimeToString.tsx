export const timeToString = (studyTime: bigint): string => {
  if (!studyTime) return "00:00:00";
  let time = Number(studyTime);
  let divide = 60 * 60;
  let timeArr: string[] = [];
  while (time != 0) {
    const result = Math.floor(time / divide);
    timeArr.push(result < 10 ? "0" + result.toString() : result.toString());
    time %= divide;
    divide /= 60;
  }
  return timeArr.join(":");
};
