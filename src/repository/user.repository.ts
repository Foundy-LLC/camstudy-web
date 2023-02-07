import { Prisma, user_account } from ".prisma/client";
import prisma from "../../prisma/client";
import { UserStatus } from "@/models/user/UserStatus";

export const isExistUser = async (
  uid: string
): Promise<{ exists: boolean }[]> => {
  return await prisma?.$queryRaw(
    Prisma.sql`SELECT EXISTS(SELECT * FROM user_account ua WHERE ua.id = ${uid})`
  );
};
export const createUser = async (
  uid: string,
  name: string,
  introduce: string | undefined,
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
      status: UserStatus.LOGIN,
      user_tag: {
        createMany: {
          data: [...tagIdsDto],
        },
      },
    },
  });
};

export const insertProfileImage = async (uid: string, url: string) => {
  return await prisma.user_account.update({
    data: {
      profile_image: url,
    },
    where: {
      id: uid,
    },
  });
};
