export interface User {
  readonly id: string;
  readonly name: string;
  readonly introduce: string | null;
  //TODO: 랭킹 산정 방식 나오면 다시 계산
  readonly rankingScore: number;
  readonly totalStudyMinute: number;
  readonly organizations: Array<string>;
  readonly tags: Array<string>;
}
