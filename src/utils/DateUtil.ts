export const getMinutesDiff = (a: Date, b: Date) => {
  return (a.getTime() - b.getTime()) / 60 / 1000;
};

const KR_TIME_DIFF_MILLI = 9 * 60 * 60 * 1000;

export const convertToKoreaDate = (date: Date) => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + KR_TIME_DIFF_MILLI);
};
