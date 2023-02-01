import { UserRequestBody } from "@/models/user.model";
import {
  NAME_LENGTH_ERROR_MESSAGE,
  NO_NAME_ERROR_MESSAGE,
} from "@/constants/message";

describe("UserRequestBody", () => {
  it("success", () => {
    // when
    const user = new UserRequestBody("uid", "name", "intro", ["tag"]);

    // then
    expect(user).toBeDefined();
  });

  it("should throw error when name is undefined", () => {
    // given
    const name: any = null;

    // when
    const createUser = () => {
      return new UserRequestBody("uid", name, "intro", ["tag"]);
    };

    // then
    expect(() => {
      createUser();
    }).toThrowError(new Error(NO_NAME_ERROR_MESSAGE));
  });

  it("should throw error when name length is out of range", () => {
    // given
    const name = "";

    // when
    const createUser = () => {
      return new UserRequestBody("uid", name, "intro", ["tag"]);
    };

    // then
    expect(() => {
      createUser();
    }).toThrowError(new Error(NAME_LENGTH_ERROR_MESSAGE));
  });
});

export {};
