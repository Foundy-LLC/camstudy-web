export const cropGrade = {
  NOT_FRESH: "not_fresh",
  FRESH: "fresh",
  SILVER: "silver",
  GOLD: "gold",
  DIAMOND: "diamond",
} as const;
export type CROP_GRADE = (typeof cropGrade)[keyof typeof cropGrade];
