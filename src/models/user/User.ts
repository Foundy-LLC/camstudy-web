import { FRIEND_STATUS } from "@/constants/FriendStatus";

export interface User {
  readonly id: string;
  readonly name: string;
  readonly profileImage?: string;
  readonly consecutiveStudyDays: number;
  readonly requestHistory: FRIEND_STATUS;
  readonly introduce: string | null;
  readonly organizations: Array<string>;
  readonly tags: Array<string>;
}
