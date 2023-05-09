import { user_account } from ".prisma/client";
import prisma from "../../prisma/client";
import { UserStatus } from "@/models/user/UserStatus";
import { User } from "@/models/user/User";
import { SEARCH_USERS_MAX_NUM } from "@/constants/user.constant";
import { UserSearchOverview } from "@/models/user/UserSearchOverview";
import { friendStatus } from "@/constants/FriendStatus";
import { Prisma } from "@prisma/client";
import { STANDARD_END_HOUR_OF_DAY } from "@/constants/common";

const getConsecutiveStudyDays = async (userId: string): Promise<number> => {
  const minusUsingStandardHourText: string = `-${STANDARD_END_HOUR_OF_DAY} hours`;
  const queryResult = await prisma.$queryRaw<{ count: number }[]>(Prisma.sql`
    with local_study_dates as (
        select distinct(
           (join_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul' + interval ${Prisma.raw(
             `'${minusUsingStandardHourText}'`
           )})::date
        ) as study_date
        from study_history
        where user_id = ${userId}
    )
    select count(*)
    from local_study_dates
    where local_study_dates.study_date > (
        select date
        from generate_series(date('2023-05-01'), current_timestamp AT TIME ZONE 'KST' + interval ${Prisma.raw(
          `'${minusUsingStandardHourText}'`
        )}, '1 day') serial_dates(date)
        left outer join local_study_dates on local_study_dates.study_date = serial_dates.date::date
        where local_study_dates.study_date is null
        order by serial_dates.date desc
        limit 1
    )
  `);
  if (queryResult.length === 0) {
    return 0;
  }
  return Number(queryResult[0].count);
};

export const findUser = async (
  userId: string,
  requesterId: string
): Promise<User | null> => {
  const userAccount = await prisma.user_account.findUnique({
    where: {
      id: userId,
    },
    include: {
      user_tag: {
        include: {
          tag: true,
        },
      },
      friend_friend_acceptor_idTouser_account: {
        where: { requester_id: requesterId, acceptor_id: userId },
        select: { accepted: true },
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
  const organizations = userAccount.belong.map((b) => b.organization.name);
  const tags = userAccount.user_tag.map((t) => t.tag.name);

  return {
    id: userAccount.id,
    name: userAccount.name,
    profileImage: userAccount.profile_image ?? undefined,
    consecutiveStudyDays: await getConsecutiveStudyDays(userId),
    requestHistory:
      userAccount.friend_friend_acceptor_idTouser_account[0] != null
        ? userAccount.friend_friend_acceptor_idTouser_account[0].accepted
          ? friendStatus.ACCEPTED
          : friendStatus.REQUESTED
        : friendStatus.NONE,
    introduce: userAccount.introduce,
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

/**
 * @return [마지막 페이지 값, 현재 페이지의 친구 검색 결과 목록]
 */
export const getSimilarNamedUsers = async (
  userName: string,
  userId: string
): Promise<{ maxPage: number; users: UserSearchOverview[] }> => {
  const removeSpace = userName.replace(/ /g, "");
  const splitName = removeSpace.split("#");
  const result = await prisma.$transaction([
    prisma.user_account.count({
      where: {
        name: { startsWith: splitName[0] },
        id: { startsWith: splitName[1] },
        NOT: { id: userId },
      },
    }),
    prisma.user_account.findMany({
      take: SEARCH_USERS_MAX_NUM,
      where: {
        name: { startsWith: splitName[0] },
        id: { startsWith: splitName[1] },
        NOT: { id: userId },
      },
      select: {
        id: true,
        name: true,
        profile_image: true,
        friend_friend_acceptor_idTouser_account: {
          where: { requester_id: userId },
          select: { accepted: true },
        },
      },
    }),
  ]);

  return {
    maxPage: result[0],
    users: result[1].map((item) => {
      return {
        id: item.id,
        name: item.name,
        profileImage: item.profile_image,
        requestHistory: item.friend_friend_acceptor_idTouser_account[0]
          ? item.friend_friend_acceptor_idTouser_account[0].accepted === true
            ? friendStatus.ACCEPTED
            : friendStatus.REQUESTED
          : friendStatus.NONE,
      };
    }),
  };
};

export const createUser = async (
  userId: string,
  name: string,
  introduce: string | null,
  tagIds: { id: string }[]
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
    },
  });
};

export const editUserProfile = async (
  userId: string,
  nickName: string,
  introduce: string,
  tags: { id: string }[]
) => {
  const tagIdsDto: { tag_id: string }[] = tags.map((tag) => {
    return { tag_id: tag.id };
  });
  await prisma.user_account.update({
    data: {
      name: nickName,
      introduce: introduce,
      user_tag: {
        createMany: {
          data: [...tagIdsDto],
          skipDuplicates: true,
        },
      },
    },
    where: { id: userId },
  });
};

export const updateUserProfileImage = async (userId: string, url: string) => {
  return await prisma.user_account.update({
    data: {
      profile_image: url,
    },
    where: {
      id: userId,
    },
  });
};
