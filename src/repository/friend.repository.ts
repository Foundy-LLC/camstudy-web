import client from "../../prisma/client";
import { FriendRequestUser } from "@/models/friend/FriendRequestUser";

export const addFriend = async (userId: string, targetUserId: string) => {
  await client.friend.create({
    data: {
      requester_id: userId,
      acceptor_id: targetUserId,
      requested_at: new Date(),
      accepted: false,
    },
  });
};
export const deleteFriendRequest = async (
  userId: string,
  targetUserId: string
) => {
  await client.friend.delete({
    where: {
      requester_id_acceptor_id: {
        requester_id: userId,
        acceptor_id: targetUserId,
      },
    },
  });
};

export const fetchFriendRequests = async (
  userId: string
): Promise<FriendRequestUser[]> => {
  const requests = await client.friend.findMany({
    where: { acceptor_id: userId },
    select: {
      user_account_friend_requester_idTouser_account: {
        select: { id: true, name: true, profile_image: true },
      },
    },
  });
  return requests.map((request) => {
    const { id, name, profile_image } =
      request.user_account_friend_requester_idTouser_account;
    return {
      requesterId: id,
      requesterName: name,
      profileImage: profile_image,
    };
  });
};
