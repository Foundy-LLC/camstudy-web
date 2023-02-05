import { makeAutoObservable, runInAction } from "mobx";
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "@firebase/auth";
import { auth } from "@/service/firebase";
import userService from "@/service/user.service";

export class UserStore {
  private _googleAuthProvider = new GoogleAuthProvider();
  private _githubAuthProvider = new GithubAuthProvider();
  private _isNewUser: boolean | undefined = undefined;

  constructor() {
    makeAutoObservable(this);
  }

  get isNewUser(): boolean | undefined {
    return this._isNewUser;
  }

  signOut = async () => {
    await auth.signOut();
    if (auth.currentUser == null) this._isNewUser = undefined;
  };

  private _fetchIsNewUser = async (uid: string) => {
    const exist: boolean = await userService.isExistUser(uid);
    runInAction(() => {
      this._isNewUser = !exist;
    });
  };

  signInWithGoogle = async () => {
    try {
      const firebaseApp = await signInWithPopup(auth, this._googleAuthProvider);
      await this._fetchIsNewUser(firebaseApp.user.uid);
    } catch (e) {
      console.log(e);
    }
  };

  signInWithGithub = async () => {
    try {
      const firebaseApp = await signInWithPopup(auth, this._githubAuthProvider);
      await this._fetchIsNewUser(firebaseApp.user.uid);
    } catch (e) {
      console.log(e);
    }
  };
}

const userStore = new UserStore();
export default userStore;
