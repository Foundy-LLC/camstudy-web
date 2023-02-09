import { WelcomeStore } from "@/stores/WelcomeStore";
import { deepEqual, instance, mock, when } from "ts-mockito";
import { Result } from "@/models/common/Result";
import { UserService } from "@/service/user.service";
import {
  PROFILE_IMAGE_INVALID_EXTENSION,
  PROFILE_IMAGE_SIZE_ERROR_MESSAGE,
  TAG_COUNT_ERROR_MESSAGE,
  TAG_LENGTH_ERROR_MESSAGE,
  USER_INTRODUCE_LENGTH_ERROR_MESSAGE,
  USER_NAME_LENGTH_ERROR_MESSAGE,
} from "@/constants/message";
import { USER_INTRODUCE_MAX_LENGTH } from "@/constants/user.constant";
import { MAX_IMAGE_BYTE_SIZE } from "@/constants/image.constant";

describe("WelcomeStore.createUser", () => {
  it("success", async () => {
    // given
    const userId = "uid";
    const name = "name";
    const introduce = "intro";
    const tags = ["tag"];
    const stubService: UserService = mock(UserService);
    when(
      stubService.createUser(
        userId,
        name,
        introduce,
        deepEqual(tags),
        undefined
      )
    ).thenResolve(Result.success(undefined));
    const welcomeStore = new WelcomeStore(instance(stubService));
    expect(welcomeStore.successToCreate).toBe(false);

    // when
    welcomeStore.changeName(name);
    welcomeStore.changeIntroduce(introduce);
    welcomeStore.changeTags(tags.join(" "));
    await welcomeStore.createUser(userId);

    // then
    expect(welcomeStore.successToCreate).toBe(true);
  });

  it("should have error message when failed ", async () => {
    // given
    const userId = "uid";
    const name = "name";
    const introduce = "intro";
    const tags = ["tag"];
    const error = Error("failed");
    const stubService: UserService = mock(UserService);
    when(
      stubService.createUser(
        userId,
        name,
        introduce,
        deepEqual(tags),
        undefined
      )
    ).thenResolve(Result.createErrorUsingException(error));
    const welcomeStore = new WelcomeStore(instance(stubService));
    expect(welcomeStore.errorMessage).toBeUndefined();

    // when
    welcomeStore.changeName(name);
    welcomeStore.changeIntroduce(introduce);
    welcomeStore.changeTags(tags.join(" "));
    await welcomeStore.createUser(userId);

    // then
    expect(welcomeStore.errorMessage).toBe(error.message);
  });
});

describe("WelcomeStore.nameErrorMessage", () => {
  it("no error", () => {
    // given
    const welcomeStore = new WelcomeStore();
    expect(welcomeStore.nameErrorMessage).toBeUndefined();

    // when
    welcomeStore.changeName("valid");

    // then
    expect(welcomeStore.nameErrorMessage).toBeUndefined();
  });
  test.each(["very long long long long long name", ""])(
    "should have error message when name is updated and not valid",
    (name) => {
      // given
      const welcomeStore = new WelcomeStore();
      expect(welcomeStore.nameErrorMessage).toBeUndefined();

      // when
      welcomeStore.changeName(name);

      // then
      expect(welcomeStore.nameErrorMessage).toBe(
        USER_NAME_LENGTH_ERROR_MESSAGE
      );
    }
  );
});

describe("WelcomeStore.introduceErrorMessage", () => {
  it("no error", () => {
    // given
    const welcomeStore = new WelcomeStore();
    expect(welcomeStore.introduceErrorMessage).toBeUndefined();

    // when
    welcomeStore.changeIntroduce("valid");

    // then
    expect(welcomeStore.introduceErrorMessage).toBeUndefined();
  });
  it("should have error message when introduce is updated and very long", () => {
    // given
    const welcomeStore = new WelcomeStore();
    expect(welcomeStore.introduceErrorMessage).toBeUndefined();
    let introduce = "";
    for (let i = 0; i < USER_INTRODUCE_MAX_LENGTH + 1; ++i) {
      introduce += "h";
    }

    // when
    welcomeStore.changeIntroduce(introduce);

    // then
    expect(welcomeStore.introduceErrorMessage).toBe(
      USER_INTRODUCE_LENGTH_ERROR_MESSAGE
    );
  });
});

describe("WelcomeStore.tagsErrorMessage", () => {
  it("no error", () => {
    // given
    const welcomeStore = new WelcomeStore();
    expect(welcomeStore.tagsErrorMessage).toBeUndefined();

    // when
    welcomeStore.changeTags("valid");

    // then
    expect(welcomeStore.tagsErrorMessage).toBeUndefined();
  });
  it("should have error message tags are updated and exceed 3", () => {
    // given
    const welcomeStore = new WelcomeStore();
    expect(welcomeStore.tagsErrorMessage).toBeUndefined();

    // when
    welcomeStore.changeTags("tag tag2 tag3 tag4");

    // then
    expect(welcomeStore.tagsErrorMessage).toBe(TAG_COUNT_ERROR_MESSAGE);
  });
  it("should have error message tags are updated and length exceed", () => {
    // given
    const welcomeStore = new WelcomeStore();
    expect(welcomeStore.tagsErrorMessage).toBeUndefined();

    // when
    welcomeStore.changeTags("taglonglonglonglonglo");

    // then
    expect(welcomeStore.tagsErrorMessage).toBe(TAG_LENGTH_ERROR_MESSAGE);
  });
});

describe("WelcomeStore.profileImageUrlErrorMessage", () => {
  it("no error", () => {
    //given
    const mockFile = mock<File>();
    when(mockFile.name).thenReturn("mock.png");
    when(mockFile.size).thenReturn(MAX_IMAGE_BYTE_SIZE - 1);
    const welcomeStore = new WelcomeStore();
    expect(welcomeStore.profileImageUrlErrorMessage).toBeUndefined();

    //when
    welcomeStore.changeProfileImage(instance(mockFile));

    //then
    expect(welcomeStore.profileImageUrlErrorMessage).toBeUndefined();
  });

  it("should have error message profile image invalid extension", () => {
    //given
    const mockFile = mock<File>();
    when(mockFile.name).thenReturn("mock.gif");
    when(mockFile.size).thenReturn(MAX_IMAGE_BYTE_SIZE - 1);
    const welcomeStore = new WelcomeStore();
    expect(welcomeStore.profileImageUrlErrorMessage).toBeUndefined();

    //when
    welcomeStore.changeProfileImage(instance(mockFile));

    //then
    expect(welcomeStore.profileImageUrlErrorMessage).toBe(
      PROFILE_IMAGE_INVALID_EXTENSION
    );
  });

  it("should have error message profile image size more than 5MB ", () => {
    //given
    const mockFile = mock<File>();
    when(mockFile.name).thenReturn("mock.png");
    when(mockFile.size).thenReturn(MAX_IMAGE_BYTE_SIZE + 1);
    const welcomeStore = new WelcomeStore();
    expect(welcomeStore.profileImageUrlErrorMessage).toBeUndefined();

    //when
    welcomeStore.changeProfileImage(instance(mockFile));

    //then
    expect(welcomeStore.profileImageUrlErrorMessage).toBe(
      PROFILE_IMAGE_SIZE_ERROR_MESSAGE
    );
  });
});

export {};
