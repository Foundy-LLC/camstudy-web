export const getMinutesDiff = (a: Date, b: Date) => {
  return (a.getTime() - b.getTime()) / 60 / 1000;
};
