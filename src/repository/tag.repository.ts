import { Prisma } from "@prisma/client";
import prisma from "../../prisma/client";
import { uuidv4 } from "@firebase/util";
import tagWhereInput = Prisma.tagWhereInput;
import { SEARCH_USERS_MAX_NUM } from "@/constants/user.constant";
import client from "../../prisma/client";
import { ORGANIZATION_NUM_PER_PAGE } from "@/constants/organization.constant";
import { TAG_NUM_PER_PAGE } from "@/constants/tag.constant";

export const createTagsIfNotExists = async (tagNames: string[]) => {
  const data: { id: string; name: string }[] = tagNames.map((tagName) => {
    return {
      id: uuidv4(),
      name: tagName,
    };
  });

  await prisma.tag.createMany({
    data: [...data],
    skipDuplicates: true,
  });
};

export const findTagIdsByTagName = async (
  tagNames: string[]
): Promise<{ id: string }[]> => {
  const whereInputs = tagNames.map<tagWhereInput>((tagName) => {
    return {
      name: {
        equals: tagName,
      },
    };
  });
  return await prisma.tag.findMany({
    where: {
      OR: [...whereInputs],
    },
    select: {
      id: true,
    },
  });
};

export const findUserTags = async (userId: string): Promise<string[]> => {
  const tags = await prisma.user_tag.findMany({
    where: {
      user_id: userId,
    },
    include: {
      tag: true,
    },
  });
  return tags.map((t) => t.tag.name);
};

export const findSimilarTags = async (pageNum: number, name?: string) => {
  return await client.tag.findMany({
    skip: pageNum * TAG_NUM_PER_PAGE,
    take: TAG_NUM_PER_PAGE,
    where: { name: { startsWith: name } },
    orderBy: { name: "asc" },
    select: { name: true },
  });
};
