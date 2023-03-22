import { RootStore } from "@/stores/RootStore";
import { Crop } from "@/models/crop/Crop";
import { CropService, cropService } from "@/service/crop.service";
import userStore from "@/stores/UserStore";
import { NO_USER_STORE_ERROR_MESSAGE } from "@/constants/message";
import { makeAutoObservable, runInAction } from "mobx";

export class CropStore {
  readonly rootStore: RootStore;
  private _harvestedCrops: Crop[] = [];
  constructor(
    root: RootStore,
    private readonly _cropService: CropService = cropService
  ) {
    this.rootStore = root;
    makeAutoObservable(this);
  }
  public get harvestedCrops() {
    return this._harvestedCrops;
  }

  public getHarvestedCrops = async () => {
    try {
      if (!userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const uid = userStore.currentUser.id;
      const result = await this._cropService.getHarvestedCrops(uid);
      if (result.isSuccess) {
        runInAction(() => {
          this._harvestedCrops = result.getOrNull()!;
        });
      } else {
        throw new Error(result.throwableOrNull()!.message);
      }
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
    }
  };
}
