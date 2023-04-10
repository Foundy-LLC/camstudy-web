import { RootStore } from "@/stores/RootStore";
import { makeAutoObservable } from "mobx";

export class PagenationStore {
  readonly rootStore: RootStore;
  private _currentPage: number = 1;
  constructor(root: RootStore) {
    makeAutoObservable(this);
    this.rootStore = root;
  }

  public get currentPage() {
    return this._currentPage;
  }
}
