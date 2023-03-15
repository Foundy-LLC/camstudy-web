import client from "../../prisma/client";
import { FriendRequestUser } from "@/models/friend/FriendRequestUser";
import { ORGANIZATION_NUM_PER_PAGE } from "@/constants/organization.constant";
import { UserOverview } from "@/models/user/UserOverview";
import { UserStatus } from "@/models/user/UserStatus";

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
  userId: string,
  accepted: boolean
): Promise<FriendRequestUser[]> => {
  const requests = await client.friend.findMany({
    take: ORGANIZATION_NUM_PER_PAGE,
    where: { acceptor_id: userId, accepted: accepted },
    orderBy: [{ requested_at: "desc" }],
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

export const fetchFriendList = async (
  userId: string,
  pageNum: number,
  accepted: boolean
): Promise<UserOverview[]> => {
  const requests = await client.friend.findMany({
    skip: pageNum * ORGANIZATION_NUM_PER_PAGE,
    take: ORGANIZATION_NUM_PER_PAGE,
    where: { acceptor_id: userId, accepted: accepted },
    select: {
      user_account_friend_requester_idTouser_account: {
        select: {
          id: true,
          name: true,
          profile_image: true,
          score: true,
          status: true,
        },
      },
    },
  });
  return requests.map((request) => {
    const { id, name, profile_image, score, status } =
      request.user_account_friend_requester_idTouser_account;
    return {
      id: id,
      name: name,
      profileImage: profile_image,
      rankingScore: Number(score),
      status: status === "login" ? UserStatus.LOGIN : UserStatus.LOGOUT,
    };
  });
};

export const approveFriendRequest = async (
  friendId: string,
  userId: string
) => {
  await client.friend.update({
    where: {
      requester_id_acceptor_id: { requester_id: friendId, acceptor_id: userId },
    },
    data: { accepted: true },
  });
};
