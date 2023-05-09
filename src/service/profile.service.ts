import { Result } from "@/models/common/Result";
import { User } from "@/models/user/User";
import { UidValidationRequestBody } from "@/models/common/UidValidationRequestBody";
import { fetchAbsolute } from "@/utils/fetchAbsolute";
import { UserUpdateRequestBody } from "@/models/user/UserUpdateRequestBody";
import { validateUid } from "@/utils/user.validator";
import { TagDeleteRequestBody } from "@/models/tag/TagDeleteRequestBody";
import { RankGetRequestBody } from "@/models/profile/ProfileGetRequestBody";

const HEADER = {
  "Content-Type": "application/json",
};

export class ProfileService {
  public getUserProfile = async (
    userId: string,
    requesterId: string
  ): Promise<Result<User>> => {
    try {
      const RequestBody = new RankGetRequestBody(userId, requesterId);
      const response = await fetchAbsolute(
        `api/users/${RequestBody.userId}?requesterId=${RequestBody.requesterId}`,
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

  public updateProfile = async (
    userId: string,
    nickName: string,
    introduce: string,
    tags: string[]
  ) => {
    try {
      const RequestBody = new UserUpdateRequestBody(
        userId,
        nickName,
        introduce,
        tags
      );
      const response = await fetchAbsolute(`api/users/${RequestBody.userId}`, {
        method: "PATCH",
        body: JSON.stringify(RequestBody),
        headers: HEADER,
      });
      if (response.ok) {
        return Result.createSuccessUsingResponseData(response);
      } else {
        return Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  };

  public deleteTag = async (
    userId: string,
    tag: string
  ): Promise<Result<string>> => {
    try {
      const RequestBody = new TagDeleteRequestBody(userId, tag);
      const response = await fetchAbsolute(
        `api/users/${RequestBody.userId}/tag?tag=${RequestBody.tag}`,
        {
          method: "DELETE",
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
const profileService = new ProfileService();
export default profileService;
