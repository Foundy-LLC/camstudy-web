import { RankGetRequestBody } from "@/models/rank/RankGetRequestBody";
import { Result } from "@/models/common/Result";
import { UserRankingOverview } from "@/models/rank/UserRankingOverview";
import { UserRankGetRequestBody } from "@/models/rank/UserRankGetRequestBody";
import { fetchAbsolute } from "@/utils/fetchAbsolute";
import { rankingApiFetch } from "@/utils/rankingApiFetch";

export class RankService {
  public getRank = async (
    organizationId: string | undefined,
    pageNum: number,
    isWeeklyRank: boolean
  ): Promise<
    Result<{ totalUserCount: bigint; users: UserRankingOverview[] }>
  > => {
    try {
      const requestBody = new RankGetRequestBody(
        organizationId,
        pageNum,
        isWeeklyRank
      );
      let response;
      // if (requestBody.isWeeklyRank) {
      // }else{
      response = await rankingApiFetch(
        `api/ranking?page=${requestBody.pageNum}&weekly=${requestBody.isWeeklyRank}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // }

      if (response.ok) {
        return Result.createSuccessUsingResponseData(response);
      } else {
        return Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  };

  public getUserRank = async (
    userId: string,
    organizationId: string | undefined,
    isWeeklyRank: boolean
  ): Promise<
    Result<{ totalUserCount: bigint; users: UserRankingOverview }>
  > => {
    try {
      const requestBody = new UserRankGetRequestBody(
        userId,
        organizationId,
        isWeeklyRank
      );
      const response = await rankingApiFetch(
        `api/ranking/${requestBody.userId}?&weekly=${requestBody.isWeeklyRank}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // }

      if (response.ok) {
        return Result.createSuccessUsingResponseData(response);
      } else {
        return Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  };
}
const rankService = new RankService();
export default rankService;
