import { UserPostRequestBody } from "@/models/user/UserPostRequestBody";
import { Result } from "@/models/common/Result";
import { User } from "@/models/user/User";

const HEADER = {
  "Content-Type": "application/json",
};

export class UserService {
  public async getUser(userId: string): Promise<Result<User>> {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}`,
        {
          headers: HEADER,
          method: "GET",
        }
      );
      if (response.ok)
        return await Result.createSuccessUsingResponseData(response);
      else return await Result.createErrorUsingResponseMessage(response);
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  }

  public async isExistUser(userId: string): Promise<Result<boolean>> {
    try {
      const response = await fetch(`api/users/${userId}/exists`, {
        method: "GET",
        headers: HEADER,
      });
      if (response.ok) {
        return await Result.createSuccessUsingResponseData(response);
      } else {
        return await Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  }

  public async uploadProfileImage(
    fileName: string,
    formData: FormData
  ): Promise<Result<string>> {
    try {
      const response = await fetch(`api/users/${fileName}/profile-image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (response.ok) {
        return await Result.createSuccessUsingResponseData(response);
      } else {
        return await Result.createErrorUsingResponseMessage(response);
      }
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  }

  public async createUser(
    uid: string,
    name: string,
    introduce: string,
    tags: string[]
  ): Promise<Result<void>> {
    try {
      const requestBody = new UserPostRequestBody(uid, name, introduce, tags);
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

export const config = {
  api: {
    bodyParser: false,
  },
};
