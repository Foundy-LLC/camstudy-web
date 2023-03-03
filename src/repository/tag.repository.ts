import { Prisma } from "@prisma/client";
import prisma from "../../prisma/client";
import { uuidv4 } from "@firebase/util";
import tagWhereInput = Prisma.tagWhereInput;
import { SEARCH_USERS_MAX_NUM } from "@/constants/user.constant";

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
