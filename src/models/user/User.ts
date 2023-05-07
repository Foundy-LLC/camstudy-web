export interface User {
  readonly id: string;
  readonly name: string;
  readonly profileImage?: string;
  readonly introduce: string | null;
  readonly organizations: Array<string>;
  readonly tags: Array<string>;
}
