import { UserStatus } from "@/models/user/UserStatus";

export interface UserOverview {
  id: string;
  name: string;
  profileImage: string | null;
  introduce: string | null;
  status: UserStatus;
}
