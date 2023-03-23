import { makeAutoObservable } from "mobx";

export class RoomOverview {
  constructor(
    readonly id: string,
    readonly masterId: string,
    readonly title: string,
    readonly hasPassword: boolean,
    readonly thumbnail: string | null,
    readonly joinCount: number,
    readonly maxCount: number,
    readonly tags?: Array<string>
  ) {
    makeAutoObservable(this);
  }
}
