import { RootStore } from "@/stores/RootStore";
import { HarvestedCrop } from "@/models/crop/HarvestedCrop";
import { CropService, cropService } from "@/service/crop.service";
import { UserStore } from "@/stores/UserStore";
import { NO_USER_STORE_ERROR_MESSAGE } from "@/constants/message";
import { makeAutoObservable, runInAction } from "mobx";
import { GrowingCrop } from "@/models/crop/GrowingCrop";
import { UidValidationRequestBody } from "@/models/common/UidValidationRequestBody";
import { CROPS } from "@/constants/crops";

export class CropStore {
  readonly rootStore: RootStore;
  private _userStore: UserStore;
  private _growingCrop: GrowingCrop | undefined = undefined;
  private _harvestedCrops: HarvestedCrop[] = [];
  private _cropImageSrc: string | undefined = undefined;
  private _cropName = "";

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

  public get cropImageSrc() {
    return this._cropImageSrc;
  }

  public get cropName() {
    return this._cropName;
  }

  private _setCropImage() {
    if (this._growingCrop == undefined) return;

    CROPS.map((crop) => {
      if (crop.type == this._growingCrop!.type) {
        switch (crop.type) {
          case "cabbage":
            this._cropName = "양배추";
            break;
          case "strawberry":
            this._cropName = "딸기";
            break;
          case "tomato":
            this._cropName = "토마토";
            break;
          case "pumpkin":
            this._cropName = "호박";
            break;
          case "carrot":
            this._cropName = "당근";
            break;
        }
        this._cropImageSrc = crop.imageUrls[this._growingCrop!.level];
        return;
      }
    });
  }

  public fetchGrowingCrop = async (userId: string) => {
    try {
      const reqBody = new UidValidationRequestBody(userId);
      const result = await this._cropService.getGrowingCrop(reqBody.userId);
      if (result.isSuccess) {
        runInAction(() => {
          this._growingCrop = result.getOrNull()!;
          this._setCropImage();
        });
      } else {
        throw new Error(result.throwableOrNull()!.message);
      }
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
    }
  };

  //TODO: 작물 수확하고 작물 이미지랑 이름 비워주기
  public getHarvestedCrops = async (userId: string) => {
    try {
      const result = await this._cropService.getHarvestedCrops(userId);
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
