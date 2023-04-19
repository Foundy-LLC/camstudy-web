import { crops_type } from "@prisma/client";

export interface GrowingCrop {
  id: string;
  ownerId: string;
  type: crops_type;
  level: number;
  expectedGrade: string;
  isDead: boolean;
  plantedAt: Date;
}
