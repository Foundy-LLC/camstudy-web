import { CropsGrade } from "@/models/crop/CropsGrade";

export function determineCropsGrade(average_study_time: number): CropsGrade {
  if (average_study_time < 1) {
    return CropsGrade.NOT_FRESH;
  } else if (average_study_time < 2) {
    return CropsGrade.FRESH;
  } else if (average_study_time < 4) {
    return CropsGrade.SILVER;
  } else if (average_study_time < 8) {
    return CropsGrade.GOLD;
  } else {
    return CropsGrade.DIAMOND;
  }
}
