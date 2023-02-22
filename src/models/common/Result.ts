import { ResponseBody } from "@/models/common/ResponseBody";

class Failure {
  constructor(public error: Error) {}
}

export class Result<T> {
  private constructor(private _data?: T) {}

  static success<T>(data: T): Result<T> {
    return new Result(data);
  }

  static error<T>(e: Error): Result<T> {
    return new Result<any>(new Failure(e));
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
   * 성공 응답의 메세지를 이용하여 {@link Result.success}를 만드는 유틸함수입니다.
   */
  static async createSuccessUsingResponseMessage<T>(
    response: Response
  ): Promise<Result<string>> {
    const responseWrapper = await Result.parseToResponseBody<T>(response);
    const message = responseWrapper.message;
    return Result.success(message);
  }

  /**
   * {@link Result.error}를 만드는 유틸함수입니다.
   */
  static async createErrorUsingResponseMessage<T>(
    response: Response
  ): Promise<Result<T>> {
    const responseWrapper = await Result.parseToResponseBody<T>(response);
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

  public get isSuccess(): boolean {
    return !this.isFailure;
  }

  public get isFailure(): boolean {
    return this._data instanceof Failure;
  }

  public getOrNull = (): T | undefined => {
    if (this.isSuccess) {
      return this._data;
    }
    return undefined;
  };

  public throwableOrNull = (): Error | undefined => {
    if (this._data instanceof Failure) {
      return this._data.error;
    }
    return undefined;
  };
}
