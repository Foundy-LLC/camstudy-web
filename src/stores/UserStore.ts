import { makeAutoObservable, runInAction } from "mobx";
import {
  Auth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "@firebase/auth";
import { auth } from "@/service/firebase";
import userService, { UserService } from "@/service/user.service";
import { NO_USER_UID_ERROR_MESSAGE } from "@/constants/message";
import { User } from "@/models/user/User";

export class UserStore {
  private _currentUser: User | undefined;
  private _googleAuthProvider = new GoogleAuthProvider();
  private _githubAuthProvider = new GithubAuthProvider();
  private _isNewUser: boolean | undefined = undefined;
  private _errorMessage?: string = undefined;

  constructor(
    private readonly _userService: UserService = userService,
    private readonly _auth: Auth = auth
  ) {
    makeAutoObservable(this);
    this._checkAuth().then();
  }

  get isNewUser(): boolean | undefined {
    return this._isNewUser;
  }

  get currentUser() {
    return this._currentUser;
  }

  public get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  signOut = async () => {
    await auth.signOut();
    if (auth.currentUser == null) this._isNewUser = undefined;
  };

  //TODO: 함수명 맘에 안듬
  private _checkAuth = async () => {
    if (this._auth.currentUser != null) {
      await this._fetchCurrentUser(this._auth.currentUser.uid);
    }
    const unsubscribe = this._auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (user != null) {
        await this._fetchCurrentUser(user.uid);
      } else {
        //TODO: 로그인 실패 처리
        this._errorMessage = NO_USER_UID_ERROR_MESSAGE;
        return;
      }
    });
  };

  private _fetchCurrentUser = async (userId: string) => {
    const result = await this._userService.getUser(userId);
    if (result.isSuccess) {
      runInAction(() => {
        this._currentUser = result.getOrNull();
      });
    } else {
      runInAction(() => {
        this._errorMessage = result.throwableOrNull()!!.message;
        return;
      });
    }
  };

  private _fetchIsNewUser = async (uid: string) => {
    const result = await this._userService.isExistUser(uid);
    if (result.isSuccess) {
      runInAction(() => {
        this._isNewUser = !result.getOrNull();
      });
    } else {
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
