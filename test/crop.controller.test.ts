import { getRequiredConsecutiveAttendanceDays } from "@/controller/crop.controller";
describe("getRequiredConsecutiveAttendanceDays", () => {
  it("1", () => {
    // when
    const plantedDate = new Date(2023, 4, 10, 7, 10);
    const currentDate = new Date(2023, 4, 11, 7, 10);

    const result = getRequiredConsecutiveAttendanceDays(
      plantedDate,
      5,
      currentDate
    );

    // then
    expect(result).toBe(1);
  });
  it("2", () => {
    // when
    const plantedDate = new Date(2023, 4, 10, 7, 10);
    const currentDate = new Date(2023, 4, 11, 5, 59);

    const result = getRequiredConsecutiveAttendanceDays(
      plantedDate,
      5,
      currentDate
    );

    // then
    expect(result).toBe(0);
  });
  it("3", () => {
    // when
    const plantedDate = new Date(2023, 4, 10, 3, 10);
    const currentDate = new Date(2023, 4, 10, 6, 0);

    const result = getRequiredConsecutiveAttendanceDays(
      plantedDate,
      5,
      currentDate
    );

    // then
    expect(result).toBe(1);
  });
  it("4", () => {
    // when
    const plantedDate = new Date(2023, 4, 10, 7, 10);
    const currentDate = new Date(2023, 4, 13, 5, 59);

    const result = getRequiredConsecutiveAttendanceDays(
      plantedDate,
      5,
      currentDate
    );

    // then
    expect(result).toBe(2);
  });
});
