import { Room } from "@/stores/RoomListStore";

export class RoomOverview {
  //방 제목, 패스워드
  constructor(
    readonly id: string,
    readonly title: string,
    readonly password: string | null,
    // readonly joinCount: number,
    // readonly maxCount: number,
    readonly thumbnail: string | null,
    readonly tags?: Array<String>
  ) {}
}
