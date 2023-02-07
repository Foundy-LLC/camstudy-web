export class Range {
  constructor(readonly min: number, readonly max: number) {
    if (min > max) {
      throw Error("Must min is lower than max");
    }
  }

  public isInRange = (value: number): boolean => {
    return this.min <= value && value <= this.max;
  };

  public toString = (): string => {
    return `${this.min}~${this.max}`;
  };
}
