import { RootStore } from "@/stores/RootStore";
import { makeAutoObservable, runInAction } from "mobx";
import { OrganizationService } from "@/service/organization.service";
import { organization } from "@prisma/client";
import { useCallback } from "react";
import firebase from "firebase/compat";
import functions = firebase.functions;
import { bool } from "aws-sdk/clients/signer";

export class OrganizationStore {
  private _typedName: string = "";
  private _recommendOrganizations: organization[] = [];
  private _organizationService: OrganizationService = new OrganizationService();
  private _errorMessage: string = "";
  private _emailVerityButtonDisable: boolean = true;
  constructor(root: RootStore) {
    makeAutoObservable(this);
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

  public checkIfNameIncluded() {
    const result = this._recommendOrganizations.find((element) => {
      if (element.name === this._typedName) return true;
    });
    return result;
  }

  private setRecommendOrganizations(nameList: organization[]) {
    this._recommendOrganizations = nameList;
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
        this._errorMessage = "";
        this.setRecommendOrganizations(result.getOrNull()!!);
      });
    } else {
      runInAction(() => {
        this._errorMessage = result.throwableOrNull()!.message;
      });
    }
  }
}
