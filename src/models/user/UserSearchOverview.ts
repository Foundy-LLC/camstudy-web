import { RequestHistory } from "@/models/friend/RequestHistory";

export interface UserSearchOverview {
  id: string;
  name: string;
  profileImage: string | null;
  requestHistory: RequestHistory[];
}
