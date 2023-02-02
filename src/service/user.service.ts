import { UserRequestBody } from "@/models/user/UserRequestBody";
import { Result } from "@/models/common/Result";

const HEADER = {
  "Content-Type": "application/json",
};

class UserService {
  public createUser = async (
    userRequestBody: UserRequestBody
  ): Promise<Result<void>> => {
    try {
      const response = await fetch(`api/users`, {
        method: "POST",
        body: JSON.stringify(userRequestBody),
        headers: HEADER,
      });
      if (response.ok) {
        return Result.success(undefined);
      } else {
        return await Result.errorResponse(response);
      }
    } catch (e) {
      return Result.errorCatch(e);
    }
  };
}

const userService = new UserService();
export default userService;
