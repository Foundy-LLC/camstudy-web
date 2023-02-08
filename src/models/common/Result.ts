import { ResponseBody } from "@/models/common/ResponseBody";

export class Result<T> {
  private constructor(
    readonly _data?: T,
    private _error?: Error,
    private _isError: boolean = false
  ) {}

  static success<T>(data: T): Result<T> {
    return new Result(data, undefined, false);
  }

  static error<T>(e: Error): Result<T> {
    return new Result<any>(undefined, e, true);
  }

  public static async parseToResponseBody<T>(
    response: Response
  ): Promise<ResponseBody<T>> {
    return (await response.json()) as ResponseBody<T>;
  }

  /**
   * {@link ResponseBody}로부터 data만 포함하여 {@link Result.success}를 생성할때 사용하는 유틸함수입니다.
   */
  static async createSuccessUsingResponseData<T>(
    response: Response
  ): Promise<Result<T>> {
    const responseWrapper = await Result.parseToResponseBody<T>(response);
    return Result.success(responseWrapper.data);
  }

  /**
   * {@link Result.error}를 만드는 유틸함수입니다.
   */
  static async createErrorUsingResponseMessage<T>(
    response: Response
  ): Promise<Result<T>> {
    const responseWrapper = await Result.parseToResponseBody<undefined>(
      response
    );
    const error = Error(responseWrapper.message);
    return Result.error(error);
  }

  /**
   * {@link Result.error}를 만드는 유틸함수입니다.
   */
  static createErrorUsingException<T>(e: unknown): Result<T> {
    if (e instanceof Error) {
      return Result.error(e);
    }
    if (typeof e === "string") {
      return Result.error(Error(e));
    }
    console.log(e);
    return Result.error(Error("알 수 없는 에러가 발생했습니다."));
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
