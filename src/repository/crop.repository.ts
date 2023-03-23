import { uuidv4 } from "@firebase/util";
import { CropCreateRequestBody } from "@/models/crop/CropCreateRequestBody";
import prisma from "../../prisma/client";
import { CropHarvestRequestBody } from "@/models/crop/CropHarvestRequestBody";
import { Prisma } from ".prisma/client";
import { fruit_grade } from "@prisma/client";
import { Crop } from "@/models/crop/Crop";
import { CropDeleteRequestBody } from "@/models/crop/CropDeleteRequestBody";

export const getHarvestedCrops = async (userId: string): Promise<Crop[]> => {
  const harvestedCrops = await prisma.crops.findMany({
    where: {
      user_id: userId,
      harvested_at: {
        not: null,
      },
    },
    orderBy: {
      harvested_at: "desc",
    },
  });
  return harvestedCrops.map((crop) => {
    return {
      type: crop.type,
      grade: crop.grade!,
    };
  });
};

export const getGrowingCrop = async (userId: string) => {
  const result = await prisma.crops.findMany({
    where: {
      user_id: userId,
      harvested_at: null,
    },
  });
  return result.length != 0 ? result[0] : undefined;
};

export const createCrop = async (body: CropCreateRequestBody) => {
  await prisma.crops.create({
    data: {
      id: uuidv4(),
      user_id: body.userId,
      type: body.cropType,
      planted_at: new Date(),
      harvested_at: null,
      grade: null,
    },
  });
};

export const deleteCrop = async (body: CropDeleteRequestBody) => {
  await prisma.crops.delete({
    where: {
      id_user_id: {
        user_id: body.userId,
        id: body.cropId,
      },
    },
  });
};

export const getTargetCropTypeAndPlantedDate = async (
  body: CropHarvestRequestBody
) => {
  return await prisma.crops.findUnique({
    select: {
      type: true,
      planted_at: true,
    },
    where: {
      id_user_id: {
        id: body.cropId,
        user_id: body.userId,
      },
    },
  });
};

export const getConsecutiveAttendanceDays = async (
  userId: string,
  start: Date,
  requireDay: number
): Promise<number> => {
  const msToAdd = requireDay * 24 * 60 * 60 * 1000;

  const result: { num_continuous_days: number }[] = await prisma.$queryRaw(
    Prisma.sql`WITH study_days AS (SELECT DISTINCT CASE
                                                       WHEN DATE_PART('hour', sh.join_at::timestamp with time zone) >= 6
                                                           THEN date_trunc('day', sh.join_at::timestamp with time zone + interval '6 hours')
                                                       ELSE date_trunc('day', sh.join_at::timestamp with time zone - interval '18 hours')
                                                       END AS day
               FROM study_history sh
               WHERE sh.user_id = ${userId}
                 AND sh.join_at >= ${start}
                 AND sh.join_at
                   < ${new Date(start.getTime() + msToAdd)}
                   )
                   , continuous_days AS (
               SELECT
                   day, ROW_NUMBER() OVER () - DATE_PART('day', day) AS day_number
               FROM study_days
                   )
    SELECT COUNT(*) AS num_continuous_days
    FROM continuous_days
    GROUP BY day_number
    ORDER BY num_continuous_days DESC LIMIT 1;`
  );
  return Number(result[0].num_continuous_days);
};

export const getAverageStudyTime = async (
  body: CropHarvestRequestBody,
  plantedAt: Date,
  requireDay: number
): Promise<number> => {
  const msToAdd = requireDay * 24 * 60 * 60 * 1000;

  const result: { average_study_time: number }[] = await prisma.$queryRaw(
    Prisma.sql`SELECT SUM(extract(epoch from (COALESCE(exit_at, ${new Date(
      plantedAt.getTime() + msToAdd
    )}) - join_at))) / (3600 * ${requireDay}) as average_study_time
               FROM study_history
               WHERE user_id = ${body.userId}
                 AND join_at >= ${plantedAt}
                 AND join_at < ${new Date(plantedAt.getTime() + msToAdd)}
               GROUP BY user_id;`
  );

  return result[0].average_study_time;
};

export const harvestCrop = async (
  body: CropHarvestRequestBody,
  grade: fruit_grade
) => {
  return await prisma.crops.update({
    where: {
      id_user_id: {
        id: body.cropId,
        user_id: body.userId,
      },
    },
    data: {
      grade: grade,
      harvested_at: new Date(),
    },
  });
};
