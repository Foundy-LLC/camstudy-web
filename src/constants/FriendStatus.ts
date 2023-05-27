export const friendStatus = {
  NONE: "NONE",
  REQUESTED: "REQUESTED",
  REQUEST_RECEIVED: "REQUEST_RECEIVED",
  ACCEPTED: "ACCEPTED",
} as const;
export type FRIEND_STATUS = (typeof friendStatus)[keyof typeof friendStatus];
