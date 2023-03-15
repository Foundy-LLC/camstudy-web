import { crops_type } from "@prisma/client";

export interface Crops {
  type: crops_type;
  requireDay: number;
  imageUrls: string[];
}

const CROPS: Crops[] = [
  {
    type: crops_type.strawberry,
    requireDay: 3,
    imageUrls: [
      "src/assets/strawberry/plant_strawberry_1.png",
      "src/assets/strawberry/plant_strawberry_2.png",
      "src/assets/strawberry/plant_strawberry_3.png",
      "src/assets/strawberry/plant_strawberry_4.png",
      "src/assets/strawberry/plant_strawberry_5.png",
    ],
  },
  {
    type: crops_type.tomato,
    requireDay: 5,
    imageUrls: [
      "src/assets/tomato/plant_tomato_1.png",
      "src/assets/tomato/plant_tomato_2.png",
      "src/assets/tomato/plant_tomato_3.png",
      "src/assets/tomato/plant_tomato_4.png",
      "src/assets/tomato/plant_tomato_5.png",
    ],
  },
  {
    type: crops_type.carrot,
    requireDay: 7,
    imageUrls: [
      "src/assets/carrot/plant_carrot_1.png",
      "src/assets/carrot/plant_carrot_2.png",
      "src/assets/carrot/plant_carrot_3.png",
    ],
  },
  {
    type: crops_type.pumpkin,
    requireDay: 9,
    imageUrls: [
      "src/assets/pumpkin/plant_pumpkin_1.png",
      "src/assets/pumpkin/plant_pumpkin_2.png",
      "src/assets/pumpkin/plant_pumpkin_3.png",
      "src/assets/pumpkin/plant_pumpkin_4.png",
      "src/assets/pumpkin/plant_pumpkin_5.png",
    ],
  },
  {
    type: crops_type.cabbage,
    requireDay: 11,
    imageUrls: [
      "src/assets/cabbage/plant_corn_1.png",
      "src/assets/cabbage/plant_corn_2.png",
      "src/assets/cabbage/plant_corn_2-1.png",
      "src/assets/cabbage/plant_corn_2-2.png",
      "src/assets/cabbage/plant_corn_2-3.png",
    ],
  },
];
