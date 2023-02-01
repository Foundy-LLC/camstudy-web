import { UserRequestBody } from "@/models/user/UserRequestBody";
import {
  NO_TAG_ERROR_MESSAGE,
  NO_USER_NAME_ERROR_MESSAGE,
  TAG_LENGTH_ERROR_MESSAGE,
  USER_INTRODUCE_LENGTH_ERROR_MESSAGE,
  USER_NAME_LENGTH_ERROR_MESSAGE,
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
    }).toThrowError(new Error(NO_USER_NAME_ERROR_MESSAGE));
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
    }).toThrowError(new Error(USER_NAME_LENGTH_ERROR_MESSAGE));
  });

  it("should throw error when introduce length is out of range", () => {
    // given
    let introduce: string = "";
    for (let i = 0; i < 101; ++i) {
      introduce += "k";
    }

    // when
    const createUser = () => {
      return new UserRequestBody("uid", "name", introduce, ["tag"]);
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
      return new UserRequestBody("uid", "name", "intro", tags);
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
      return new UserRequestBody("uid", "name", "intro", tags);
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
      return new UserRequestBody("uid", "name", "intro", tags);
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
    const user = new UserRequestBody("uid", "name", "intro", tags);

    // then
    expect(user.tags.length).toBe(1);
  });

  it("should filter duplicated tags", () => {
    // given
    const tags = ["hi", "bye", "hi"];

    // when
    const user = new UserRequestBody("uid", "name", "intro", tags);

    // then
    expect(user.tags.length).toBe(2);
  });
});

export {};