import { makeAutoObservable } from "mobx";

export class RoomOverview {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly password: string | null,
    readonly thumbnail: string | null,
    readonly joinCount: number,
    readonly maxCount: number,
    readonly tags?: Array<String>
  ) {
    makeAutoObservable(this);
  }
}
