import { Result } from "@/models/common/Result";
import { FriendPostRequestBody } from "@/models/friend/FriendPostRequestBody";
import { SimilarNamedFriendsGetRequestBody } from "@/models/friend/SimilarNamedFriendsGetRequestBody";
import { UserSearchOverview } from "@/models/user/UserSearchOverview";
import { UidValidationRequestBody } from "@/models/common/UidValidationRequestBody";
import { FriendRequestUser } from "@/models/friend/FriendRequestUser";
import { UserOverview } from "@/models/user/UserOverview";
import { fetchAbsolute, rankingApiFetch } from "@/utils/fetchAbsolute";
import { validateUid } from "@/utils/user.validator";

const HEADER = {
  "Content-Type": "application/json",
};
export class FriendService {
  public findUserByName = async (
    userName: string,
    userId: string
  ): Promise<Result<{ maxPage: number; users: UserSearchOverview[] }>> => {
    try {
      const friendGetRequestBody = new SimilarNamedFriendsGetRequestBody(
        userName,
        userId
      );
      const response = await fetchAbsolute(
        `api/users?name=${encodeURIComponent(
          friendGetRequestBody.userName
        )}&id=${friendGetRequestBody.userId}`,
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

  public getFriendList = async (
    userId: string,
    page: number
  ): Promise<Result<{ maxPage: number; friends: UserOverview[] }>> => {
    try {
      const friendRequestBody = new UidValidationRequestBody(userId);
      const response = await fetchAbsolute(
        `api/users/${friendRequestBody.userId}/friends?page=${page - 1}`,
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

  public sendFriendRequest = async (userId: string, targetUserId: string) => {
    try {
      const friendRequestBody = new FriendPostRequestBody(userId, targetUserId);
      const response = await fetchAbsolute(
        `api/users/${friendRequestBody.userId}/friends`,
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

  public deleteFriendOrRequest = async (
    userId: string,
    targetUserId: string
  ) => {
    try {
      const friendRequestBody = new FriendPostRequestBody(userId, targetUserId);
      const response = await fetchAbsolute(
        `api/users/${friendRequestBody.userId}/friends/${friendRequestBody.targetUserId}`,
        {
          method: "DELETE",
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

  public getFriendRequests = async (
    userId: string
  ): Promise<Result<UserOverview[]>> => {
    try {
      const friendRequestBody = new UidValidationRequestBody(userId);
      const response = await fetchAbsolute(
        `api/users/${friendRequestBody.userId}/friends?accepted=false`,
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

  public acceptFriendRequest = async (
    userId: string,
    accepterId: string
  ): Promise<Result<string>> => {
    try {
      const friendRequestBody = new FriendPostRequestBody(accepterId, userId);
      const response = await fetchAbsolute(
        `api/users/${friendRequestBody.userId}/friends/${friendRequestBody.targetUserId}`,
        {
          method: "PUT",
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
  public getRecommendFriend = async (
    userId: string
  ): Promise<Result<{ users: UserOverview[] }>> => {
    try {
      const RequestBody = new UidValidationRequestBody(userId);
      const response = await rankingApiFetch(
        `api/users/${RequestBody.userId}/recommended-friends`,
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
}

const friendService = new FriendService();
export default friendService;
