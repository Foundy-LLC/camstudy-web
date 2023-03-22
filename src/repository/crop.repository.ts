import { uuidv4 } from "@firebase/util";
import { CropCreateRequestBody } from "@/models/crop/CropCreateRequestBody";
import prisma from "../../prisma/client";
import { CropIdRequestBody } from "@/models/crop/CropIdRequestBody";
import { Prisma } from ".prisma/client";
import { fruit_grade } from "@prisma/client";
import { CropDeleteRequestBody } from "@/models/crop/CropDeleteRequestBody";
import { Crop } from "@/models/crop/Crop";

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

export const isExistGrowingCrop = async (userId: string) => {
  return await prisma.crops.findMany({
    where: {
      user_id: userId,
      harvested_at: null,
    },
  });
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

export const deleteCrop = async (body: CropIdRequestBody) => {
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
  body: CropIdRequestBody
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
  body: CropIdRequestBody,
  start: Date,
  requireDay: number
): Promise<{ num_continuous_days: number }[]> => {
  const msToAdd = requireDay * 24 * 60 * 60 * 1000;

  return await prisma.$queryRaw(
    Prisma.sql`WITH study_days AS (SELECT DISTINCT CASE
                                    WHEN DATE_PART('hour', sh.join_at::timestamp with time zone) >= 6
                                        THEN date_trunc('day', sh.join_at::timestamp with time zone + interval '6 hours')
                                        ELSE date_trunc('day', sh.join_at::timestamp with time zone - interval '18 hours')
                                        END AS day
               FROM study_history sh
               WHERE sh.user_id = ${body.userId}
                 AND sh.join_at >= ${start}
                 AND sh.join_at < ${new Date(start.getTime() + msToAdd)}
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
};

export const getAverageStudyTime = async (
  body: CropIdRequestBody,
  plantedAt: Date,
  requireDay: number
): Promise<{ average_study_time: number }[]> => {
  const msToAdd = requireDay * 24 * 60 * 60 * 1000;

  return await prisma.$queryRaw(
    Prisma.sql`SELECT SUM(extract(epoch from (COALESCE(exit_at, ${new Date(
      plantedAt.getTime() + msToAdd
    )}) - join_at))) / (3600 * ${requireDay}) as average_study_time
               FROM study_history
               WHERE user_id = ${body.userId}
                 AND join_at >= ${plantedAt}
                 AND (exit_at <= ${new Date(
                   plantedAt.getTime() + msToAdd
                 )} OR exit_at IS NULL)
               GROUP BY user_id;`
  );
};

export const harvestCrop = async (
  body: CropIdRequestBody,
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
