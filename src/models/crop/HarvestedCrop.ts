import { crops_type, fruit_grade } from "@prisma/client";

export interface HarvestedCrop {
  type: crops_type;
  grade: fruit_grade;
  plantedAt: Date;
  harvestedAt: Date;
}
