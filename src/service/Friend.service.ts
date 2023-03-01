import { Result } from "@/models/common/Result";
import { OrganizationsEmailJWTBody } from "@/models/organization/OrganizationsEmailJWTBody";
import { FriendPostRequestBody } from "@/models/friend/FriendPostRequestBody";

const HEADER = {
  "Content-Type": "application/json",
};
export class FriendService {
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
