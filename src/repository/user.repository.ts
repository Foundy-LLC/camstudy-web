import { user_account } from ".prisma/client";
import prisma from "../../prisma/client";

export const createUser = async (
  uid: string,
  name: string,
  introduce: string,
  tagIds: { id: string }[]
): Promise<user_account> => {
  const tagIdsDto: { tag_id: string }[] = tagIds.map((tag) => {
    return { tag_id: tag.id };
  });
  return await prisma.user_account.create({
    data: {
      id: uid,
      name: name,
      introduce: introduce,
      score: 0,
      status: "login",
      user_tag: {
        createMany: {
          data: [...tagIdsDto],
        },
      },
    },
  });
};
