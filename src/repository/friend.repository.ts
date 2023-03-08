import client from "../../prisma/client";

export const AddFriend = async (userId: string, targetUserId: string) => {
  await client.friend.create({
    data: {
      requester_id: userId,
      acceptor_id: targetUserId,
      requested_at: new Date(),
      accepted: false,
    },
  });
};
export const CancelFriendRequest = async (
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
