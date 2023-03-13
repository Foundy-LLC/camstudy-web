import { REQUEST_QUERY_ERROR } from "@/constants/message";
import { acceptFriendRequest } from "@/controller/friend.controller";

export const validateAccepted = (accepted: string) => {
  if (accepted !== "true" && accepted !== "false") throw REQUEST_QUERY_ERROR;
};

export const validateAcceptedBoolean = (accepted: boolean | undefined) => {
  if (accepted === undefined) throw REQUEST_QUERY_ERROR;
};
