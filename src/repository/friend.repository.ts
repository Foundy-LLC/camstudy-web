import client from "../../prisma/client";
import { UserOverview } from "@/models/user/UserOverview";
import { UserStatus } from "@/models/user/UserStatus";
import { FRIEND_NUM_PER_PAGE } from "@/constants/friend.constant";
import _ from "lodash";

export const hasFriendRequest = async ({
  acceptorId,
  requesterId,
}: {
  acceptorId: string;
  requesterId: string;
}): Promise<boolean> => {
  const request = await client.friend.findUnique({
    where: {
      requester_id_acceptor_id: {
        requester_id: requesterId,
        acceptor_id: acceptorId,
      },
    },
  });
  return request != null;
};

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

export const deleteFriendOrRequest = async (
  userId: string,
  targetUserId: string
) => {
  // 상대방이 이미 친구 요청을 수락한 경우
  await client.$transaction(async (tx) => {
    const result = await tx.friend.findUnique({
      where: {
        requester_id_acceptor_id: {
          requester_id: userId,
          acceptor_id: targetUserId,
        },
      },
    });
    // 상대방이 아직 친구 요청을 수락하지 않은 경우
    if (result && result.accepted === false) {
      await tx.friend.delete({
        where: {
          requester_id_acceptor_id: {
            requester_id: userId,
            acceptor_id: targetUserId,
          },
        },
      });
    } else {
      await tx.friend.delete({
        where: {
          requester_id_acceptor_id: {
            requester_id: userId,
            acceptor_id: targetUserId,
          },
        },
      });
      await tx.friend.delete({
        where: {
          requester_id_acceptor_id: {
            requester_id: targetUserId,
            acceptor_id: userId,
          },
        },
      });
    }
  });
};

export const fetchFriendRequests = async (
  userId: string,
  page: number
): Promise<UserOverview[]> => {
  const requests = await client.friend.findMany({
    skip: page * FRIEND_NUM_PER_PAGE,
    take: FRIEND_NUM_PER_PAGE,
    where: { acceptor_id: userId, accepted: false },
    orderBy: [{ requested_at: "desc" }],
    select: {
      user_account_friend_requester_idTouser_account: {
        select: {
          id: true,
          name: true,
          introduce: true,
          profile_image: true,
          status: true,
        },
      },
    },
  });

  return requests.map((request) => {
    const { id, name, introduce, profile_image, status } =
      request.user_account_friend_requester_idTouser_account;
    return {
      id,
      name,
      profileImage: profile_image,
      introduce: introduce,
      status: status === "login" ? UserStatus.LOGIN : UserStatus.LOGOUT,
    };
  });
};

/**
 * @return [마지막 페이지 값, 현재 페이지의 친구 목록]
 */
export const fetchFriendList = async (
  userId: string,
  pageNum: number
): Promise<{ maxPage: number; friends: UserOverview[] }> => {
  const requests = await client.$transaction([
    client.friend.count({ where: { requester_id: userId, accepted: true } }),
    client.friend.findMany({
      skip: pageNum * FRIEND_NUM_PER_PAGE,
      take: FRIEND_NUM_PER_PAGE,
      where: { requester_id: userId, accepted: true },
      select: {
        user_account_friend_acceptor_idTouser_account: {
          select: {
            id: true,
            name: true,
            profile_image: true,
            introduce: true,
            status: true,
          },
        },
      },
    }),
  ]);
  return {
    maxPage: requests[0],
    friends: requests[1].map((request) => {
      const { id, name, profile_image, introduce, status } =
        request.user_account_friend_acceptor_idTouser_account;
      return {
        id: id,
        name: name,
        profileImage: profile_image,
        introduce: introduce,
        status: status === "login" ? UserStatus.LOGIN : UserStatus.LOGOUT,
      };
    }),
  };
};

export const approveFriendRequest = async (
  friendId: string,
  userId: string
) => {
  await client.$transaction(async (tx) => {
    await tx.friend.update({
      where: {
        requester_id_acceptor_id: {
          requester_id: friendId,
          acceptor_id: userId,
        },
      },
      data: { accepted: true },
    });
    await tx.friend.create({
      data: {
        requester_id: userId,
        acceptor_id: friendId,
        requested_at: new Date(),
        accepted: true,
      },
    });
  });
};

export const fetchRecommendedFriends = async (
  userId: string
): Promise<UserOverview[]> => {
  const userTags = await client.user_account.findMany({
    where: {
      id: userId,
    },
    select: {
      user_tag: {
        select: {
          tag: {
            select: {
              user_tag: {
                where: {
                  NOT: {
                    user_id: userId,
                  },
                  user_account: {
                    friend_friend_acceptor_idTouser_account: {
                      none: {
                        requester_id: userId,
                      },
                    },
                  },
                },
                select: {
                  user_account: true,
                },
              },
            },
          },
        },
      },
    },
  });
  const result = userTags.flatMap<UserOverview>((userTag) => {
    return userTag.user_tag.flatMap((tag) => {
      return tag.tag.user_tag.flatMap<UserOverview>((userTag) => {
        const { id, name, profile_image, introduce, status } =
          userTag.user_account;
        return {
          id: id,
          name: name,
          profileImage: profile_image ? profile_image : null,
          introduce: introduce ? introduce : null,
          status:
            status === UserStatus.LOGIN ? UserStatus.LOGIN : UserStatus.LOGOUT,
        };
      });
    });
  });
  return _.uniqBy(result, "id");
};
