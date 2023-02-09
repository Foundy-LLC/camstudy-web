import { makeAutoObservable, runInAction } from "mobx";
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "@firebase/auth";
import { auth } from "@/service/firebase";
import userService, { UserService } from "@/service/user.service";

export class UserStore {
  private _googleAuthProvider = new GoogleAuthProvider();
  private _githubAuthProvider = new GithubAuthProvider();
  private _isNewUser: boolean | undefined = undefined;
  private _errorMessage?: string = undefined;

  constructor(private readonly _userService: UserService = userService) {
    makeAutoObservable(this);
  }

  get isNewUser(): boolean | undefined {
    return this._isNewUser;
  }

  public get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  signOut = async () => {
    await auth.signOut();
    if (auth.currentUser == null) this._isNewUser = undefined;
  };

  private _fetchIsNewUser = async (uid: string) => {
    const result = await this._userService.isExistUser(uid);
    if (result.isSuccess) {
      runInAction(() => {
        this._isNewUser = !result.getOrNull();
      });
    } else {
      console.log(result.isSuccess);
      runInAction(() => {
        this._errorMessage = result.throwableOrNull()!!.message;
      });
    }
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
