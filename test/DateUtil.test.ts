import { getMinutesDiff } from "@/utils/DateUtil";

describe("getMinutesDiff", () => {
  it("should work correctly", () => {
    const a = new Date("2023-02-05T11:48:59.636Z");
    const b = new Date("2023-02-05T11:38:59.636Z");

    const result = getMinutesDiff(a, b);

    expect(result).toBe(10);
  });
});

export {};
