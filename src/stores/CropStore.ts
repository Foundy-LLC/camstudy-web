import { RootStore } from "@/stores/RootStore";
import { HarvestedCrop } from "@/models/crop/HarvestedCrop";
import { CropService, cropService } from "@/service/crop.service";
import { UserStore } from "@/stores/UserStore";
import { NO_USER_STORE_ERROR_MESSAGE } from "@/constants/message";
import { makeAutoObservable, runInAction } from "mobx";
import { GrowingCrop } from "@/models/crop/GrowingCrop";
import { UidValidationRequestBody } from "@/models/common/UidValidationRequestBody";

export class CropStore {
  readonly rootStore: RootStore;
  private _userStore: UserStore;
  private _growingCrop: GrowingCrop | undefined = undefined;
  private _harvestedCrops: HarvestedCrop[] = [];

  constructor(
    root: RootStore,
    private readonly _cropService: CropService = cropService
  ) {
    this._userStore = root.userStore;
    this.rootStore = root;
    makeAutoObservable(this);
  }

  public get harvestedCrops() {
    return this._harvestedCrops;
  }

  public get growingCrop() {
    return this._growingCrop;
  }

  public fetchGrowingCrop = async (userId: string) => {
    try {
      const reqBody = new UidValidationRequestBody(userId);
      const result = await this._cropService.getGrowingCrop(reqBody.userId);
      if (result.isSuccess) {
        runInAction(() => {
          this._growingCrop = result.getOrNull()!;
        });
      } else {
        throw new Error(result.throwableOrNull()!.message);
      }
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
    }
  };

  public getHarvestedCrops = async () => {
    try {
      if (!this._userStore.currentUser) {
        throw new Error(NO_USER_STORE_ERROR_MESSAGE);
      }
      const uid = this._userStore.currentUser.id;
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
