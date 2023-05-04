import { FRIEND_STATUS } from "@/constants/FriendStatus";
import { UserStatus } from "@/models/user/UserStatus";

export interface UserSearchOverview {
  id: string;
  name: string;
  profileImage: string | null;
  requestHistory: FRIEND_STATUS;
  introduce: string | null;
  status: UserStatus;
}
