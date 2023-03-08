import { FRIEND_STATUS } from "@/constants/FriendStatus";

export interface UserSearchOverview {
  id: string;
  name: string;
  profileImage: string | null;
  requestHistory: FRIEND_STATUS;
}
