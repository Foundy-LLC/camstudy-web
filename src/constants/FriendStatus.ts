export const friendStatus = {
  NONE: "NONE",
  REQUESTED: "REQUESTED",
  ACCEPTED: "ACCEPTED",
} as const;
export type FRIEND_STATUS = (typeof friendStatus)[keyof typeof friendStatus];
