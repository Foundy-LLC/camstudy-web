import { user_account } from ".prisma/client";
import prisma from "../../prisma/client";
import { UserStatus } from "@/models/user/UserStatus";
import { User } from "@/models/user/User";

const getMinutesDiff = (a: Date, b: Date) => {
  return a.getTime() - b.getTime() / 60 / 1000;
};

export const findUser = async (userId: string): Promise<User | null> => {
  const userAccount = await prisma.user_account.findUnique({
    where: {
      id: userId,
    },
    include: {
      study_history: {
        where: {
          NOT: {
            exit_at: null,
          },
        },
      },
      user_tag: {
        include: {
          tag: true,
        },
      },
      belong: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (userAccount == null) {
    return null;
  }
  let totalStudyMinutes = 0;
  for (const history of userAccount.study_history) {
    totalStudyMinutes += getMinutesDiff(history.exit_at!!, history.join_at);
  }

  const organizations = userAccount.belong.map((b) => b.organization.name);
  const tags = userAccount.user_tag.map((t) => t.tag.name);

  return {
    id: userAccount.id,
    name: userAccount.name,
    introduce: userAccount.introduce,
    // TODO: 실제 랭킹 산정방식 구체화되면 적용하기. 지금은 임시로 공부 시간만 산정하였음.
    rankingScore: totalStudyMinutes,
    totalStudyMinute: totalStudyMinutes,
    organizations: organizations,
    tags: tags,
  };
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
