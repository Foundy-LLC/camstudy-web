import { RootStore } from "@/stores/RootStore";
import { makeAutoObservable, runInAction } from "mobx";
import { OrganizationService } from "@/service/organization.service";
import { organization } from "@prisma/client";
import { useCallback } from "react";
import firebase from "firebase/compat";
import functions = firebase.functions;

export class OrganizationStore {
  private _typedName: string = "";
  private _recommendOrganizations: organization[] = [];
  private _organizationService: OrganizationService = new OrganizationService();
  private _errorMessage: string = "";
  constructor(root: RootStore) {
    makeAutoObservable(this);
  }

  get typedName() {
    return this._typedName;
  }

  get recommendOrganizations() {
    return this._recommendOrganizations;
  }

  private setRecommendOrganizations(nameList: organization[]) {
    this._recommendOrganizations = nameList;
  }

  //TODO 리액트 디바운스 (0.5s)
  public async onChangeNameInput(name: string) {
    if (name === "") return;
    this._typedName = name;
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
