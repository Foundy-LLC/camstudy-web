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
  harvestedImageUrl: string[];
  introduce: string;
}

export const CROPS: Crops[] = [
  {
    type: crops_type.carrot,
    requireDay: 3,
    imageUrls: [
      "/carrot/plant_carrot_1.png",
      "/carrot/plant_carrot_2.png",
      "/carrot/plant_carrot_3.png",
    ],
    harvestedImageUrl: [
      "/carrot/item_wither_carrot_1.png",
      "/carrot/item_carrot_1.png",
      "/carrot/item_silver_carrot_1.png",
      "/carrot/item_gold_carrot_1.png",
      "/carrot/item_diamond_carrot_1.png",
    ],
    introduce: "말이 좋아하는 간식. 홍당무로도 불려요",
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
    harvestedImageUrl: [
      "/tomato/item_wither_tomato_1.png",
      "/tomato/item_tomato_1.png",
      "/tomato/item_silver_tomato_1.png",
      "/tomato/item_gold_tomato_1.png",
      "/tomato/item_diamond_tomato_1.png",
    ],
    introduce: "안 그래 보여도 가지과에 속해요",
  },
  {
    type: crops_type.strawberry,
    requireDay: 0,
    imageUrls: [
      "/strawberry/plant_strawberry_1.png",
      "/strawberry/plant_strawberry_2.png",
      "/strawberry/plant_strawberry_3.png",
      "/strawberry/plant_strawberry_4.png",
      "/strawberry/plant_strawberry_5.png",
    ],
    harvestedImageUrl: [
      "/strawberry/item_wither_strawberry_1.png",
      "/strawberry/item_strawberry_1.png",
      "/strawberry/item_silver_strawberry_1.png",
      "/strawberry/item_gold_strawberry_1.png",
      "/strawberry/item_diamond_strawberry_1.png",
    ],
    introduce: "사실 겉면의 깨알들이 진짜 열매랍니다",
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
    harvestedImageUrl: [
      "/pumpkin/item_wither_pumpkin_1.png",
      "/pumpkin/item_pumpkin_1.png",
      "/pumpkin/item_silver_pumpkin_1.png",
      "/pumpkin/item_gold_pumpkin_1.png",
      "/pumpkin/item_diamond_pumpkin_1.png",
    ],
    introduce: "세계에서 가장 큰 열매를 맺는 식물",
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
    harvestedImageUrl: [
      "/cabbage/item_wither_cabbage_1.png",
      "/cabbage/item_corn_1.png",
      "/cabbage/item_silver_cabbage_1.png",
      "/cabbage/item_gold_cabbage_1.png",
      "/cabbage/item_diamond_cabbage_1.png",
    ],
    introduce: "식이섬유가 풍부하고 맛이 없어요(?)",
  },
];
