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
