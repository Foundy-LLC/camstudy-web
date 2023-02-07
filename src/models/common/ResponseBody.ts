export class ResponseBody<T> {
  readonly message: string;
  readonly data: T;

  constructor({ message, data }: { message: string; data?: T }) {
    this.message = message;
    this.data = data as T;
  }
}
