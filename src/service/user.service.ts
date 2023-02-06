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
      const { exists, message } = await res.json();
      console.log(message);
      return exists;
    } catch (e) {
      return Result.errorCatch(e);
    }
  }

  public async uploadProfileImage(fileName: string, formData: FormData) {
    try {
      const response = await fetch(`api/users/${fileName}/profile-image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const { profileImageUrl } = await response.json();
      console.log(profileImageUrl);
      if (response.ok) return profileImageUrl;
    } catch (e) {
      console.log(e);
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

export const config = {
  api: {
    bodyParser: false,
  },
};
