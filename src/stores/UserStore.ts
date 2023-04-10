import { makeAutoObservable, runInAction } from "mobx";
import {
  Auth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "@firebase/auth";
import userService, { UserService } from "@/service/user.service";
import { User } from "@/models/user/User";
import { NO_USER_UID_ERROR_MESSAGE } from "@/constants/message";
import { auth } from "@/service/firebase";
import { RootStore } from "@/stores/RootStore";

export class UserStore {
  readonly rootStore: RootStore;
  private _currentUser: User | undefined = undefined;
  private _googleAuthProvider = new GoogleAuthProvider();
  private _githubAuthProvider = new GithubAuthProvider();
  private _isNewUser: boolean | undefined = undefined;
  private _errorMessage?: string = undefined;

  constructor(
    root: RootStore,
    private readonly _userService: UserService = userService,
    private readonly _auth: Auth = auth
  ) {
    makeAutoObservable(this);
    this.rootStore = root;
    this.fetchAuth().then();
  }

  get isNewUser(): boolean | undefined {
    return this._isNewUser;
  }

  get currentUser(): User | undefined {
    return this._currentUser;
  }

  public get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  signOut = async () => {
    await this._auth.signOut();
    if (this._auth.currentUser == null) {
      this._isNewUser = undefined;
    }
  };

  fetchAuth = async () => {
    if (this._auth.currentUser != null) {
      await this.fetchCurrentUser(this._auth.currentUser.uid);
    }
    const unsubscribe = this._auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (user != null) {
        await this.fetchCurrentUser(user.uid);
      } else {
        //TODO: 로그인 실패 처리
        this._errorMessage = NO_USER_UID_ERROR_MESSAGE;
        return;
      }
    });
  };

  fetchCurrentUser = async (userId: string) => {
    const result = await this._userService.getUser(userId);
    if (result.isSuccess) {
      runInAction(() => {
        console.log("현재 유저 초기화 완료");
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
      const firebaseApp = await signInWithPopup(
        this._auth,
        this._googleAuthProvider
      );
      await this._fetchIsNewUser(firebaseApp.user.uid);
      if (!this.isNewUser) await this.fetchAuth();
    } catch (e) {
      console.log(e);
    }
  };

  signInWithGithub = async () => {
    try {
      const firebaseApp = await signInWithPopup(
        this._auth,
        this._githubAuthProvider
      );
      await this._fetchIsNewUser(firebaseApp.user.uid);
      if (!this.isNewUser) await this.fetchAuth();
    } catch (e) {
      console.log(e);
    }
  };
}

// const userStore = new UserStore();
// export default userStore;
