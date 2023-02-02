export class Result<T> {
  private constructor(
    private _data?: T,
    private _error?: Error,
    private _isError: boolean = false
  ) {}

  static success<T>(data: T) {
    return new Result(data, undefined, false);
  }

  static async errorResponse(e: Response) {
    return new Result(undefined, Error(await e.json()), true);
  }

  static errorCatch(e: unknown) {
    if (e instanceof Error) {
      return new Result(undefined, e, true);
    }
    if (typeof e === "string") {
      return new Result(undefined, Error(e), true);
    }
    console.log(e);
    return new Result(
      undefined,
      Error("알 수 없는 에러가 발생했습니다."),
      true
    );
  }

  public get isSuccess() {
    return !this._isError;
  }

  public getOrNull = (): T | undefined => {
    return this._data;
  };

  public throwableOrNull = (): Error | undefined => {
    return this._error;
  };
}
