import { UserRequestBody } from "@/models/user/UserRequestBody";
import { Result } from "@/models/common/Result";

const HEADER = {
  "Content-Type": "application/json",
};

export class UserService {
  public async isExistUser(uid: string) {
    try {
      const res = await fetch(`api/users/${uid}/init-info`, {
        method: "GET",
        headers: HEADER,
      });
      const { exists } = await res.json();
      return exists;
    } catch (e) {
      return Result.errorCatch(e);
    }
  }

  public async createUser(
    uid: string,
    name: string,
    introduce: string,
    tags: string[]
  ): Promise<Result<void>> {
    try {
      const requestBody = new UserRequestBody(uid, name, introduce, tags);
      const response = await fetch(`api/users`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: HEADER,
      });
      if (response.ok) {
        return Result.success(undefined);
      } else {
        return await Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  }
}

const userService = new UserService();
export default userService;
