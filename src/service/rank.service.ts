import { RoomService } from "@/service/room.service";
import { RankGetRequestBody } from "@/models/rank/RankGetRequestBody";
import { Result } from "@/models/common/Result";

export class RankService {
  public getRank = async (
    organizationId: string | undefined,
    pageNum: number,
    isWeeklyRank: boolean
  ): Promise<Result<any>> => {
    try {
      const requestBody = new RankGetRequestBody(
        organizationId,
        pageNum,
        isWeeklyRank
      );
      let response;
      // if (requestBody.isWeeklyRank) {
      response = await fetch(
        `/rank-server/ranking?page=${requestBody.pageNum}`,
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
