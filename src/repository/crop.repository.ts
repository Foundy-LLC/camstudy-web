import { uuidv4 } from "@firebase/util";
import { CropCreateRequestBody } from "@/models/crop/CropCreateRequestBody";
import prisma from "../../prisma/client";
import { CropHarvestRequestBody } from "@/models/crop/CropHarvestRequestBody";
import { Prisma } from ".prisma/client";
import { crops, fruit_grade } from "@prisma/client";
import { HarvestedCrop } from "@/models/crop/HarvestedCrop";
import { CropDeleteRequestBody } from "@/models/crop/CropDeleteRequestBody";
import { STANDARD_END_HOUR_OF_DAY } from "@/constants/common";
import { shiftToStandardDate } from "@/controller/crop.controller";

export const getHarvestedCrops = async (
  userId: string
): Promise<HarvestedCrop[]> => {
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
  return harvestedCrops.map<HarvestedCrop>((crop: crops) => {
    return {
      type: crop.type,
      grade: crop.grade!,
      plantedAt: crop.planted_at,
      harvestedAt: crop.harvested_at!,
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

const isSameDate = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

/**
 * 회원의 최근 연속 출석 일자를 반환한다.
 *
 * 만약 시작일 날짜와 첫 공부 기록의 날짜가 다른 경우 0을 반환한다.
 * 예를 들어 2022-04-19 05:00에 작물을 심고 2022-04-19 06:00에 공부를 시작한 경우이다.
 *
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
  const minusUsingStandardHourText: string = `-${STANDARD_END_HOUR_OF_DAY} hours`;

  const firstStudyHistoryQueryResult = await prisma.$queryRaw<
    { join_at: Date }[]
  >(Prisma.sql`
        SELECT join_at
        FROM study_history sh
        WHERE sh.user_id = ${userId}
          AND sh.join_at >= (${startDate} AT TIME ZONE 'UTC')
          AND sh.join_at < (${endDate} AT TIME ZONE 'UTC')
        ORDER BY join_at LIMIT 1
    `);
  if (firstStudyHistoryQueryResult.length === 0) {
    return 0;
  }
  const firstStudyHistory = firstStudyHistoryQueryResult[0].join_at;
  if (
    !isSameDate(
      shiftToStandardDate(firstStudyHistory),
      shiftToStandardDate(startDate)
    )
  ) {
    return 0;
  }

  const result: { consecutive_days: number }[] =
    await prisma.$queryRaw(Prisma.sql`
        WITH study_dates
                 AS (SELECT DISTINCT DATE (sh.join_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul' + interval ${Prisma.raw(
                   `'${minusUsingStandardHourText}'`
                 )}) AS date
        FROM study_history sh
        WHERE sh.user_id = ${userId}
          AND sh.join_at >= (${startDate} AT TIME ZONE 'UTC')
          AND sh.join_at
            < (${endDate} AT TIME ZONE 'UTC')
            )
            , consecutive_study_dates AS (
        SELECT date, ROW_NUMBER() OVER (ORDER BY date) AS row_number
        FROM study_dates
            )
        SELECT csd1.row_number AS consecutive_days
        FROM consecutive_study_dates csd1
                 LEFT JOIN consecutive_study_dates csd2 ON csd2.row_number = csd1.row_number + 1
        WHERE csd2.date IS NULL
           OR csd2.date <> csd1.date + INTERVAL '1 DAY'
    `);

  if (result.length === 0) {
    return 0;
  }
  return Number(result[0].consecutive_days);
};

export const getAverageStudyHours = async (
  body: CropHarvestRequestBody,
  plantedAt: Date,
  requireDay: number
): Promise<number> => {
  const msToAdd = requireDay * 24 * 60 * 60 * 1000;
  const endDate = new Date(plantedAt.getTime() + msToAdd);

  const result: { average_study_time: number }[] = await prisma.$queryRaw(
    Prisma.sql`SELECT SUM(extract(epoch from (COALESCE(exit_at, ${endDate}) - join_at))) /
                          (3600 * ${requireDay}) as average_study_time
                   FROM study_history
                   WHERE user_id = ${body.userId}
                     AND join_at >= (${plantedAt} AT TIME ZONE 'UTC')
                     AND join_at < (${endDate} AT TIME ZONE 'UTC')
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
  const endDate = new Date(plantedAt.getTime() + msToAdd);

  const result: { average_study_time: number }[] = await prisma.$queryRaw(
    Prisma.sql`SELECT SUM(extract(epoch from (exit_at - join_at))) / (3600 * ${dayDuration}) as average_study_time
                   FROM study_history
                   WHERE user_id = ${userId}
                     AND exit_at is NOT NULL
                     AND join_at >= (${plantedAt} AT TIME ZONE 'UTC')
                     AND join_at < (${endDate} AT TIME ZONE 'UTC')
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
