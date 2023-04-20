import { RootStore } from "@/stores/RootStore";
import { makeAutoObservable, runInAction } from "mobx";
import organizationService, {
  OrganizationService,
} from "@/service/organization.service";
import { UserStore } from "@/stores/UserStore";
import { ORGANIZATIONS_EMAIL_CONFIRM_SUCCESS } from "@/constants/organizationMessage";
import { OrganizationVerifyEmailForm } from "@/models/organization/OrganizationVerifyEmailForm";
import { BelongOrganization } from "@/models/organization/BelongOrganization";
import { Organization } from "@/models/organization/Organization";

//TODO(건우): 유저 아이디 불러오는 법 수정 필요
export class OrganizationStore {
  readonly rootStore: RootStore;
  private _userStore: UserStore;
  private _typedEmail: string = "";
  private _typedName: string = "";
  private _dropDownHidden: boolean = true;
  private _recommendOrganizations: Organization[] = [];
  private _belongOrganizations: BelongOrganization[] | undefined = undefined;
  private _errorMessage: string | undefined = undefined;
  private _successMessage: string | undefined = undefined;
  private _emailVerityButtonDisable: boolean = true;

  constructor(
    root: RootStore,
    private readonly _organizationService: OrganizationService = organizationService
  ) {
    this.rootStore = root;
    this._userStore = root.userStore;
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

  get belongOrganizations() {
    return this._belongOrganizations;
  }

  setEmailVerifyButtonDisable(disable: boolean) {
    this._emailVerityButtonDisable = disable;
  }

  get organizationId() {
    return this.checkTypedName ? this.recommendOrganizations[0].id : null;
  }

  get dropDownHidden() {
    return this._dropDownHidden;
  }

  public setDropDownHidden(hidden: boolean) {
    this._dropDownHidden = hidden;
  }

  public get checkTypedName() {
    if (
      this.recommendOrganizations.length === 1 &&
      this.typedName === this.recommendOrganizations[0]?.name
    )
      return true;
    else {
      return false;
    }
  }

  private setRecommendOrganizations(nameList: Organization[]) {
    this._recommendOrganizations = nameList;
  }

  public onChangeEmailInput(email: string) {
    this._typedEmail = email;
    if (!this.checkTypedName) {
      this.setEmailVerifyButtonDisable(true);
      return;
    }
    const address = this.recommendOrganizations[0].address;
    if (
      email.includes("@") &&
      email.slice(email.indexOf("@") + 1) === address
    ) {
      this.setEmailVerifyButtonDisable(false);
      this._errorMessage = undefined;
    } else {
      this.setEmailVerifyButtonDisable(true);
      if (email.includes("@") && email.includes(".")) {
        this._errorMessage = `이메일 형식이 소속 웹메일 형식(${address})과 다릅니다.`;
      } else {
        this._errorMessage = undefined;
      }
    }
  }

  public async verifyEmailConfirm(AccessToken: string) {
    const result =
      await this._organizationService.confirmOrganizationEmailVerify(
        AccessToken
      );
    if (result.isSuccess) {
      runInAction(() => {
        this._errorMessage = undefined;
        this._successMessage = ORGANIZATIONS_EMAIL_CONFIRM_SUCCESS;
        if (this._belongOrganizations !== undefined) {
          this._belongOrganizations.push(result.getOrNull()!);
        }
      });
    } else {
      runInAction(() => {
        this._successMessage = undefined;
        this._errorMessage = result.throwableOrNull()!.message;
      });
    }
  }

  public async deleteBelongOrganization(
    belongOrganization: BelongOrganization
  ) {
    const { userId, organizationId, organizationName } = belongOrganization;
    const result = await this._organizationService.deleteBelongOrganization(
      userId,
      organizationId,
      organizationName
    );
    if (result.isSuccess) {
      runInAction(() => {
        this._errorMessage = undefined;
        this._belongOrganizations = this._belongOrganizations!.filter(
          (belong) => belong.organizationId !== organizationId
        );
      });
    } else {
      runInAction(() => {
        this._successMessage = undefined;
        this._errorMessage = result.throwableOrNull()!.message;
      });
    }
  }

  public onChangeNameInput = async (name: string) => {
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
  };

  public async sendOrganizationVerifyEmail() {
    const organizationVerifyEmailForm: OrganizationVerifyEmailForm = {
      userId: this._userStore.currentUser!!.id,
      userName: this._userStore.currentUser!!.name,
      email: this._typedEmail,
      organizationId: this.organizationId!,
      organizationName: this._typedName,
    };
    console.log(organizationVerifyEmailForm);
    const result = await this._organizationService.setOrganizationEmail(
      organizationVerifyEmailForm
    );
    if (result.isSuccess) {
      runInAction(() => {
        console.log("success");
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

  public async fetchBelongOrganizations() {
    const result = await this._organizationService.getBelongOrganizations(
      this._userStore.currentUser!.id
    );
    if (result.isSuccess) {
      runInAction(() => {
        this._belongOrganizations = result.getOrNull()!;
      });
    } else {
      runInAction(() => {});
    }
  }
}
