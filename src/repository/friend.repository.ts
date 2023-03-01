import { friend } from "@prisma/client";
import client from "../../prisma/client";
import { v4 as uuidv4 } from "uuid";

export const AddFriend = async (
  userName: string,
  userId: string
): Promise<friend> => {
  const acceptor = await client.user_account.findUnique({where:{name:userName}});
  return await client.friend.create({ data: { id: uuidv4(), requester_id:userId,acceptor_id:acceptor[0].id,requested_at:} });
};
