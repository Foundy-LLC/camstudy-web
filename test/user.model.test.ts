import { UserPostRequestBody } from "@/models/user/UserPostRequestBody";
import {
  NO_TAG_ERROR_MESSAGE,
  NO_USER_NAME_ERROR_MESSAGE,
  TAG_LENGTH_ERROR_MESSAGE,
  USER_INTRODUCE_LENGTH_ERROR_MESSAGE,
  USER_NAME_LENGTH_ERROR_MESSAGE,
} from "@/constants/message";
import { USER_INTRODUCE_MAX_LENGTH } from "@/constants/user.constant";

describe("UserRequestBody", () => {
  it("success", () => {
    // when
    const user = new UserPostRequestBody(
      "uid",
      "name",
      "intro",
      ["tag"],
      undefined
    );

    // then
    expect(user).toBeDefined();
  });

  it("should throw error when name is undefined", () => {
    // given
    const name: any = null;

    // when
    const createUser = () => {
      return new UserPostRequestBody("uid", name, "intro", ["tag"], undefined);
    };

    // then
    expect(() => {
      createUser();
    }).toThrowError(new Error(NO_USER_NAME_ERROR_MESSAGE));
  });

  it("should throw error when name length is out of range", () => {
    // given
    const name = "";

    // when
    const createUser = () => {
      return new UserPostRequestBody("uid", name, "intro", ["tag"], undefined);
    };

    // then
    expect(() => {
      createUser();
    }).toThrowError(new Error(USER_NAME_LENGTH_ERROR_MESSAGE));
  });

  it("should throw error when introduce length is out of range", () => {
    // given
    let introduce: string = "";
    for (let i = 0; i < USER_INTRODUCE_MAX_LENGTH + 1; ++i) {
      introduce += "k";
    }

    // when
    const createUser = () => {
      return new UserPostRequestBody(
        "uid",
        "name",
        introduce,
        ["tag"],
        undefined
      );
    };

    // then
    expect(() => {
      createUser();
    }).toThrowError(new Error(USER_INTRODUCE_LENGTH_ERROR_MESSAGE));
  });

  it("should throw error when tags is null", () => {
    // given
    const tags: any = undefined;

    // when
    const createUser = () => {
      return new UserPostRequestBody("uid", "name", "intro", tags, undefined);
    };

    // then
    expect(() => {
      createUser();
    }).toThrowError(new Error(NO_TAG_ERROR_MESSAGE));
  });

  it("should throw error when all tags are blank", () => {
    // given
    const tags = [" ", "   "];

    // when
    const createUser = () => {
      return new UserPostRequestBody("uid", "name", "intro", tags, undefined);
    };

    // then
    expect(() => {
      createUser();
    }).toThrowError(new Error(NO_TAG_ERROR_MESSAGE));
  });

  it("should throw error when some tag length is out of range", () => {
    // given
    const tags = [" ", "123456789012345678901"];

    // when
    const createUser = () => {
      return new UserPostRequestBody("uid", "name", "intro", tags, undefined);
    };

    // then
    expect(() => {
      createUser();
    }).toThrowError(new Error(TAG_LENGTH_ERROR_MESSAGE));
  });

  it("should filter blank tags", () => {
    // given
    const tags = [" ", "  ", "hi"];

    // when
    const user = new UserPostRequestBody(
      "uid",
      "name",
      "intro",
      tags,
      undefined
    );

    // then
    expect(user.tags.length).toBe(1);
  });

  it("should filter duplicated tags", () => {
    // given
    const tags = ["hi", "bye", "hi"];

    // when
    const user = new UserPostRequestBody(
      "uid",
      "name",
      "intro",
      tags,
      undefined
    );

    // then
    expect(user.tags.length).toBe(2);
  });
});

export {};
