import { ResponseBody } from "@/models/common/ResponseBody";

describe("ResponseBody", () => {
  it("should create successfully when data is not passed", () => {
    new ResponseBody({ message: "message" });
  });
});
