import { UserStatus } from "@/models/user/UserStatus";

export interface UserRankingOverview {
  id: string;
  name: string;
  profileImage: string | null;
  ranking: number;
  rankingScore: number;
  introduce: string;
  studyTime: bigint;
  status: UserStatus;
}
