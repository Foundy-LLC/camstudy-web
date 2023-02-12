import { Result } from "@/models/common/Result";

describe("Result", () => {
  it("success", () => {
    const result = Result.success(10);

    expect(result.getOrNull()).toBe(10);
    expect(result.throwableOrNull()).toBeUndefined();
  });

  it("error", () => {
    const error = Error("ERROR");
    const result = Result.error(error);

    expect(result.getOrNull()).toBe(undefined);
    expect(result.throwableOrNull()).toBe(error);
  });
});
