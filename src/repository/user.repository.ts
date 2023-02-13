import { user_account } from ".prisma/client";
import prisma from "../../prisma/client";
import { UserStatus } from "@/models/user/UserStatus";
import { User } from "@/models/user/User";
import { Prisma } from "@prisma/client";

export const findUser = async (userId: string): Promise<User | null> => {
  // return await prisma.user_account.findUnique({
  //   select: {
  //     id: true,
  //     name: true,
  //   },
  //   where: {
  //     id: userId,
  //   },
  // });
  return await prisma.$queryRaw(Prisma.sql`select ua.id, ua."name", ua.introduce, organization.organizations, tag.tags, ranking.ranking, times.totalStudyMinute
     from user_account ua , 
    (select array_to_json(array_agg(t2."name")) as tags 
    from tag t2, user_tag ut2  
    where ut2.tag_id = t2.id 
    and ut2.user_id =${userId}
    ) tag,
    (select array_to_json(array_agg(o."name")) as organizations
    from organization o, belong b
    where o.id = b.organization_id 
    and b.user_id =${userId}
    and b.is_authenticated = true 
    ) organization,
    (select sum( extract (epoch from (sh.exit_at-sh.join_at)) / 60) as ranking 
    from study_history sh 
    where sh.user_id =${userId} 
    and sh.exit_at notnull 
    ) ranking,
    (select sum( extract (epoch from (sh.exit_at-sh.join_at)) / 60) as totalStudyMinute 
    from study_history sh 
    where sh.user_id =${userId} 
    and sh.exit_at notnull 
    ) times
     where ua.id =${userId}`);
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
