import { Result } from "@/models/common/Result";
import { User } from "@/models/user/User";
import { UidValidationRequestBody } from "@/models/common/UidValidationRequestBody";
import { fetchAbsolute } from "@/utils/fetchAbsolute";
import { userUpdateRequestBody } from "@/models/user/UserUpdateRequestBody";
import { validateUid } from "@/utils/user.validator";
import { tagDeleteRequestBody } from "@/models/tag/TagDeleteRequestBody";

const HEADER = {
  "Content-Type": "application/json",
};

export class ProfileService {
  public getUserProfile = async (userId: string): Promise<Result<User>> => {
    try {
      const RequestBody = new UidValidationRequestBody(userId);
      const response = await fetchAbsolute(`api/users/${RequestBody.userId}`, {
        method: "GET",
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

  public updateProfile = async (
    userId: string,
    nickName: string,
    introduce: string,
    tags: string[]
  ) => {
    try {
      const RequestBody = new userUpdateRequestBody(
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
      const RequestBody = new tagDeleteRequestBody(userId, tag);
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
