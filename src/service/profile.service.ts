import { Result } from "@/models/common/Result";
import { User } from "@/models/user/User";
import { ValidateUid } from "@/models/common/ValidateUid";
import { fetchAbsolute } from "@/utils/fetchAbsolute";
import { updateUserRequestBody } from "@/models/user/UpdateUserRequestBody";

const HEADER = {
  "Content-Type": "application/json",
};

export class ProfileService {
  public getUserProfile = async (userId: string): Promise<Result<User>> => {
    try {
      const RequestBody = new ValidateUid(userId);
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
      const RequestBody = new updateUserRequestBody(
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
}
const profileService = new ProfileService();
export default profileService;
