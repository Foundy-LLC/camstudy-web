import { user_account } from ".prisma/client";
import prisma from "../../prisma/client";
import { UserStatus } from "@/models/user/UserStatus";
import { User } from "@/models/user/User";

export const findUser = async (userId: string): Promise<User | null> => {
  return await prisma.user_account.findUnique({
    select: {
      id: true,
      name: true,
    },
    where: {
      id: userId,
    },
  });
};
export const isUserExists = async (userId: string): Promise<boolean> => {
  const result = await prisma.user_account.findUnique({
    where: {
      id: userId,
    },
  });
  return result !== null;
};
export const createUser = async (
  userId: string,
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
      id: userId,
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

export const insertUserProfileImage = async (userId: string, url: string) => {
  return await prisma.user_account.update({
    data: {
      profile_image: url,
    },
    where: {
      id: userId,
    },
  });
};
