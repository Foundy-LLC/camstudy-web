import { user_account } from ".prisma/client";
import prisma from "../../prisma/client";
import { UserStatus } from "@/models/user/UserStatus";

export const isUserExists = async (uid: string): Promise<boolean> => {
  const result = await prisma.user_account.findUnique({
    where: {
      id: uid,
    },
  });
  return result !== null;
};
export const createUser = async (
  uid: string,
  name: string,
  introduce: string | undefined,
  tagIds: { id: string }[],
  profileImageUrl: string | undefined
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
      profile_image: profileImageUrl,
    },
  });
};

export const insertUserProfileImage = async (uid: string, url: string) => {
  return await prisma.user_account.update({
    data: {
      profile_image: url,
    },
    where: {
      id: uid,
    },
  });
};
