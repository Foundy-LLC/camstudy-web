import { uuidv4 } from "@firebase/util";
import { CropCreateRequestBody } from "@/models/crop/CropCreateRequestBody";
import prisma from "../../prisma/client";
import { CropHarvestRequestBody } from "@/models/crop/CropHarvestRequestBody";
import { Prisma } from ".prisma/client";
import { fruit_grade } from "@prisma/client";
import { Crop } from "@/models/crop/Crop";
import { CropDeleteRequestBody } from "@/models/crop/CropDeleteRequestBody";
import { STANDARD_END_HOUR_OF_DAY } from "@/constants/common";

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

export const fetchGrowingCrop = async (userId: string) => {
  const result = await prisma.crops.findMany({
    select: {
      id: true,
      user_id: true,
      type: true,
      planted_at: true,
    },
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

/**
 * 회원의 최근 연속 출석 일자를 반환한다.
 * @param userId 회원의 아이디이다.
 * @param startDate 출석 기간을 확인할 시작 시간이다.
 * @param dayDuration 출석 기간에 포함할 기간이다. 시작 시간에 이 기간을 더하면 종료 시간이 된다.
 */
export const getConsecutiveAttendanceDays = async (
  userId: string,
  startDate: Date,
  dayDuration: number
): Promise<number> => {
  const milliDuration = dayDuration * 24 * 60 * 60 * 1000;
  const endDate = new Date(startDate.getTime() + milliDuration);
  const minusUsingStandardHourText = `-${STANDARD_END_HOUR_OF_DAY} hours`;

  const result: { num_continuous_days: number }[] = await prisma.$queryRaw(
    Prisma.sql`WITH study_days AS (SELECT DISTINCT date_trunc('day', sh.join_at + interval '${minusUsingStandardHourText}')
                   AS day
               FROM study_history sh
               WHERE sh.user_id = ${userId}
                 AND sh.join_at >= ${startDate}
                 AND sh.join_at
                   < ${endDate})
                   , continuous_days AS (
               SELECT day, ROW_NUMBER() OVER () - DATE_PART('day', day) AS day_number
               FROM study_days)
    SELECT COUNT(*) AS num_continuous_days
    FROM continuous_days
    GROUP BY day_number
    ORDER BY num_continuous_days DESC LIMIT 1;`
  );
  if (result.length === 0) {
    return 0;
  }
  return Number(result[0].num_continuous_days);
};

export const getAverageStudyHours = async (
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

export const getExpectedAverageStudyHours = async (
  userId: string,
  plantedAt: Date,
  dayDuration: number
): Promise<number> => {
  const msToAdd = dayDuration * 24 * 60 * 60 * 1000;

  const result: { average_study_time: number }[] = await prisma.$queryRaw(
    Prisma.sql`SELECT SUM(extract(epoch from (exit_at - join_at))) / (3600 * ${dayDuration}) as average_study_time
               FROM study_history
               WHERE user_id = ${userId}
                 AND exit_at is NOT NULL
                 AND join_at >= ${plantedAt}
                 AND join_at < ${new Date(plantedAt.getTime() + msToAdd)}
               GROUP BY user_id;`
  );
  if (result.length === 0) {
    return 0;
  }
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
