export const rankType = {
  TOTAL: "total",
  WEEKLY: "weekly",
  ORGANIZATIONS: "organizations",
} as const;
export type RANK_TYPE = (typeof rankType)[keyof typeof rankType];
