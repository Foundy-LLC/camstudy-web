import { CropsGrade } from "@/models/crop/CropsGrade";

export function determineCropsGrade(averageStudyTime: number): CropsGrade {
  if (averageStudyTime < 1) {
    return CropsGrade.NOT_FRESH;
  } else if (averageStudyTime < 2) {
    return CropsGrade.FRESH;
  } else if (averageStudyTime < 4) {
    return CropsGrade.SILVER;
  } else if (averageStudyTime < 8) {
    return CropsGrade.GOLD;
  } else {
    return CropsGrade.DIAMOND;
  }
}
