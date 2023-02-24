import { RootStore } from "@/stores/RootStore";
import { makeAutoObservable, runInAction } from "mobx";
import organizationService, {
  OrganizationService,
} from "@/service/organization.service";
import { organization } from "@prisma/client";
import userStore from "@/stores/UserStore";
import {
  createEmailToken,
  verifyEmailToken,
} from "@/service/manageVerifyToken";

//TODO(건우): 유저 아이디 불러오는 법 수정 필요
export class OrganizationStore {
  readonly rootStore: RootStore;
  private _typedEmail: string = "";
  private _typedName: string = "";
  private _recommendOrganizations: organization[] = [];
  private _errorMessage: string | undefined = undefined;
  private _successMessage: string | undefined = undefined;
  private _emailVerityButtonDisable: boolean = true;
  constructor(
    root: RootStore,
    private readonly _organizationService: OrganizationService = organizationService
  ) {
    this.rootStore = root;
    makeAutoObservable(this);
  }

  get errorMessage() {
    return this._errorMessage;
  }

  get successMessage() {
    return this._successMessage;
  }

  get emailVerityButtonDisable() {
    return this._emailVerityButtonDisable;
  }

  get typedName() {
    return this._typedName;
  }

  get recommendOrganizations() {
    return this._recommendOrganizations;
  }

  setEmailVerifyButtonDisable(disable: boolean) {
    this._emailVerityButtonDisable = disable;
  }
  get organizationId() {
    return this.checkIfNameIncluded()!!.id;
  }

  public checkIfNameIncluded() {
    return this._recommendOrganizations.find((element) => {
      if (element.name === this._typedName) return true;
    });
  }

  private setRecommendOrganizations(nameList: organization[]) {
    this._recommendOrganizations = nameList;
  }

  public onChangeEmailInput(email: string) {
    this._typedEmail = email;
  }

  public async verifyEmailConfirm(AccessToken: string) {
    const result =
      await this._organizationService.confirmOrganizationEmailVerify(
        AccessToken
      );
    if (result.isSuccess) {
      runInAction(() => {
        this._errorMessage = undefined;
        this._successMessage = result.getOrNull()!!;
      });
    } else {
      runInAction(() => {
        this._successMessage = undefined;
        this._errorMessage = result.throwableOrNull()!.message;
      });
    }
  }

  public async onChangeNameInput(name: string) {
    this._typedName = name;
    if (this._typedName === "") {
      this._recommendOrganizations = [];
      return;
    }
    const result = await this._organizationService.getSimilarOrganizations(
      this._typedName
    );
    if (result.isSuccess) {
      runInAction(() => {
        this._errorMessage = undefined;
        this.setRecommendOrganizations(result.getOrNull()!!);
      });
    } else {
      runInAction(() => {
        this._successMessage = undefined;
        this._errorMessage = result.throwableOrNull()!.message;
      });
    }
  }

  public async sendOrganizationVerifyEmail() {
    const result = await this._organizationService.setOrganizationEmail(
      userStore.currentUser!!.id,
      userStore.currentUser!!.name,
      this._typedEmail,
      this.organizationId
    );
    if (result.isSuccess) {
      runInAction(() => {
        this._errorMessage = undefined;
        this._successMessage = result.getOrNull()!;
      });
    } else {
      runInAction(() => {
        this._successMessage = undefined;
        this._errorMessage = result.throwableOrNull()!.message;
        console.log(this._errorMessage);
      });
    }
  }
}
