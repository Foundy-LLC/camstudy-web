import { RootStore } from "@/stores/RootStore";
import organizationService, {
  OrganizationService,
} from "@/service/organization.service";
import { FriendService } from "@/service/Friend.service";
import userStore from "@/stores/UserStore";
import { runInAction } from "mobx";
import { FRIEND_REQUEST_SUCCESS } from "@/constants/FriendMessage";

export class FriendStore {
  readonly rootStore: RootStore;
  private _friendRequestInput: string | undefined = undefined;
  private _errorMessage: string | undefined = undefined;
  private _successMessage: string | undefined = undefined;
  constructor(
    root: RootStore,
    private readonly _friendService: FriendService = _friendService
  ) {
    this.rootStore = root;
  }
  public get friendRequestInput() {
    return this._friendRequestInput;
  }

  public get errorMessage() {
    return this._errorMessage;
  }

  public get successMessage() {
    return this._successMessage;
  }

  public changeFriendRequestInput(str: string) {
    this._friendRequestInput = str;
  }
  public async sendFriendRequest() {
    if (!this._friendRequestInput) {
      return;
    }
    const result = await this._friendService.sendFriendRequest(
      this._friendRequestInput,
      userStore.currentUser?.id!
    );
    if (result.isSuccess) {
      runInAction(() => {
        this._errorMessage = undefined;
        this._successMessage = FRIEND_REQUEST_SUCCESS;
      });
    } else {
      runInAction(() => {
        this._successMessage = undefined;
        this._errorMessage = result.throwableOrNull()!.message;
      });
    }
  }
}
