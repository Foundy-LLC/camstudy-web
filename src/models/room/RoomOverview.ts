import { makeAutoObservable } from "mobx";
import { UserOverview } from "@/models/user/UserOverview";

export class RoomOverview {
  constructor(
    readonly id: string,
    readonly masterId: string,
    readonly title: string,
    readonly hasPassword: boolean,
    readonly thumbnail: string | null,
    readonly joinCount: number,
    readonly maxCount: number,
    readonly joinedUsers: UserOverview[],
    readonly tags: Array<string>
  ) {
    makeAutoObservable(this);
  }
}
