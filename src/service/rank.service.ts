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
        `${process.env.NEXT_PUBLIC_RANK_SERVER_BASE_URL}/ranking?page=${requestBody.pageNum}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // }
      console.log(response);
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
