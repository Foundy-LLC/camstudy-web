import { Result } from "@/models/common/Result";
import { OrganizationsEmailJWTBody } from "@/models/organization/OrganizationsEmailJWTBody";
import { FriendPostRequestBody } from "@/models/friend/FriendPostRequestBody";
import { SimilarNamedFriendsGetRequestBody } from "@/models/friend/SimilarNamedFriendsGetRequestBody";
import { Organization } from "@/stores/OrganizationStore";
import { UserSearchOverview } from "@/stores/FriendStore";

const HEADER = {
  "Content-Type": "application/json",
};
export class FriendService {
  public getSimilarNamedUsers = async (
    userName: string
  ): Promise<Result<UserSearchOverview[]>> => {
    try {
      const friendGetRequestBody = new SimilarNamedFriendsGetRequestBody(
        userName
      );
      const response = await fetch(
        `http://localhost:3000/api/users?name=${encodeURIComponent(
          friendGetRequestBody.userName
        )}`,
        {
          method: "GET",
          headers: HEADER,
        }
      );
      if (response.ok) {
        return Result.createSuccessUsingResponseData(response);
      } else {
        return Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  };

  public sendFriendRequest = async (userName: string, userId: string) => {
    try {
      const friendRequestBody = new FriendPostRequestBody(userName, userId);
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}/friends`,
        {
          method: "POST",
          body: JSON.stringify(friendRequestBody),
          headers: HEADER,
        }
      );
      if (response.ok) {
        return Result.createSuccessUsingResponseMessage(response);
      } else {
        return Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  };
}

const friendService = new FriendService();
export default friendService;
