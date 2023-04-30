import { crops_type } from "@prisma/client";

export interface Crops {
  type: crops_type;
  requireDay: number;
  /**
   * 작물의 단계별 이미지들이다.
   *
   * 이 필드의 length는 작물의 최대 단계이다.
   */
  imageUrls: string[];
}

export const CROPS: Crops[] = [
  {
    type: crops_type.strawberry,
    requireDay: 7,
    imageUrls: [
      "/strawberry/plant_strawberry_1.png",
      "/strawberry/plant_strawberry_2.png",
      "/strawberry/plant_strawberry_3.png",
      "/strawberry/plant_strawberry_4.png",
      "/strawberry/plant_strawberry_5.png",
    ],
  },
  {
    type: crops_type.tomato,
    requireDay: 5,
    imageUrls: [
      "/tomato/plant_tomato_1.png",
      "/tomato/plant_tomato_2.png",
      "/tomato/plant_tomato_3.png",
      "/tomato/plant_tomato_4.png",
      "/tomato/plant_tomato_5.png",
    ],
  },
  {
    type: crops_type.carrot,
    requireDay: 3,
    imageUrls: [
      "/carrot/plant_carrot_1.png",
      "/carrot/plant_carrot_2.png",
      "/carrot/plant_carrot_3.png",
    ],
  },
  {
    type: crops_type.pumpkin,
    requireDay: 9,
    imageUrls: [
      "/pumpkin/plant_pumpkin_1.png",
      "/pumpkin/plant_pumpkin_2.png",
      "/pumpkin/plant_pumpkin_3.png",
      "/pumpkin/plant_pumpkin_4.png",
      "/pumpkin/plant_pumpkin_5.png",
    ],
  },
  {
    type: crops_type.cabbage,
    requireDay: 11,
    imageUrls: [
      "/cabbage/plant_corn_1.png",
      "/cabbage/plant_corn_2.png",
      "/cabbage/plant_corn_2-1.png",
      "/cabbage/plant_corn_2-2.png",
      "/cabbage/plant_corn_2-3.png",
    ],
  },
];
