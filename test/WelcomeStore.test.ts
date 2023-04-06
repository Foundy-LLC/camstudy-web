import { WelcomeStore } from "@/stores/WelcomeStore";
import { deepEqual, instance, mock, when } from "ts-mockito";
import { Result } from "@/models/common/Result";
import { UserService } from "@/service/user.service";
import {
  IMAGE_SIZE_EXCEED_MESSAGE,
  PROFILE_IMAGE_INVALID_EXTENSION,
  TAG_COUNT_ERROR_MESSAGE,
  TAG_LENGTH_ERROR_MESSAGE,
  USER_INTRODUCE_LENGTH_ERROR_MESSAGE,
  USER_NAME_LENGTH_ERROR_MESSAGE,
} from "@/constants/message";
import { USER_INTRODUCE_MAX_LENGTH } from "@/constants/user.constant";
import { MAX_IMAGE_BYTE_SIZE } from "@/constants/image.constant";
import { RootStore } from "@/stores/RootStore";

describe("WelcomeStore.createUser", () => {
  it("success", async () => {
    // given
    const userId = "uid";
    const name = "name";
    const introduce = "intro";
    const tags = ["tag"];
    const stubService: UserService = mock(UserService);
    const rootStore: RootStore = new RootStore();
    when(
      stubService.createUser(userId, name, introduce, deepEqual(tags))
    ).thenResolve(Result.success(undefined));
    const welcomeStore = new WelcomeStore(rootStore, instance(stubService));
    expect(welcomeStore.successToCreate).toBe(false);

    // when
    welcomeStore.changeName(name);
    welcomeStore.changeIntroduce(introduce);
    welcomeStore.changeTags(tags);
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
    const rootStore: RootStore = new RootStore();
    when(
      stubService.createUser(userId, name, introduce, deepEqual(tags))
    ).thenResolve(Result.createErrorUsingException(error));
    const welcomeStore = new WelcomeStore(rootStore, instance(stubService));
    expect(welcomeStore.errorMessage).toBeUndefined();

    // when
    welcomeStore.changeName(name);
    welcomeStore.changeIntroduce(introduce);
    welcomeStore.changeTags(tags);
    await welcomeStore.createUser(userId);

    // then
    expect(welcomeStore.errorMessage).toBe(error.message);
  });
});

describe("WelcomeStore.nameErrorMessage", () => {
  it("no error", () => {
    // given
    const rootStore: RootStore = new RootStore();
    const welcomeStore = new WelcomeStore(rootStore);
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
      const rootStore: RootStore = new RootStore();
      const welcomeStore = new WelcomeStore(rootStore);
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
    const rootStore: RootStore = new RootStore();
    const welcomeStore = new WelcomeStore(rootStore);
    expect(welcomeStore.introduceErrorMessage).toBeUndefined();

    // when
    welcomeStore.changeIntroduce("valid");

    // then
    expect(welcomeStore.introduceErrorMessage).toBeUndefined();
  });
  it("should have error message when introduce is updated and very long", () => {
    // given
    const rootStore: RootStore = new RootStore();
    const welcomeStore = new WelcomeStore(rootStore);
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
    const rootStore: RootStore = new RootStore();
    const welcomeStore = new WelcomeStore(rootStore);
    expect(welcomeStore.tagsErrorMessage).toBeUndefined();

    // when
    welcomeStore.changeTags(["valid"]);

    // then
    expect(welcomeStore.tagsErrorMessage).toBeUndefined();
  });
  it("should have error message tags are updated and exceed 3", () => {
    // given
    const rootStore: RootStore = new RootStore();
    const welcomeStore = new WelcomeStore(rootStore);
    expect(welcomeStore.tagsErrorMessage).toBeUndefined();

    // when
    welcomeStore.changeTags(["tag", "tag2", "tag3", "tag4"]);

    // then
    expect(welcomeStore.tagsErrorMessage).toBe(TAG_COUNT_ERROR_MESSAGE);
  });
  it("should have error message tags are updated and length exceed", () => {
    // given
    const rootStore: RootStore = new RootStore();
    const welcomeStore = new WelcomeStore(rootStore);
    expect(welcomeStore.tagsErrorMessage).toBeUndefined();

    // when
    welcomeStore.changeTags(["taglonglonglonglonglon"]);

    // then
    expect(welcomeStore.tagsErrorMessage).toBe(TAG_LENGTH_ERROR_MESSAGE);
  });
});

describe("WelcomeStore.profileImageUrlErrorMessage", () => {
  it("no error", () => {
    //given
    const mockFile = mock<File>();
    const rootStore: RootStore = new RootStore();
    when(mockFile.name).thenReturn("mock.png");
    when(mockFile.size).thenReturn(MAX_IMAGE_BYTE_SIZE - 1);
    const welcomeStore = new WelcomeStore(rootStore);
    expect(welcomeStore.profileImageUrlErrorMessage).toBeUndefined();

    //when
    welcomeStore.changeProfileImage(instance(mockFile));

    //then
    expect(welcomeStore.profileImageUrlErrorMessage).toBeUndefined();
  });

  it("should have error message profile when image invalid extension", () => {
    //given
    const mockFile = mock<File>();
    const rootStore: RootStore = new RootStore();
    when(mockFile.name).thenReturn("mock.gif");
    when(mockFile.size).thenReturn(MAX_IMAGE_BYTE_SIZE - 1);
    const welcomeStore = new WelcomeStore(rootStore);
    expect(welcomeStore.profileImageUrlErrorMessage).toBeUndefined();

    //when
    welcomeStore.changeProfileImage(instance(mockFile));

    //then
    expect(welcomeStore.profileImageUrlErrorMessage).toBe(
      PROFILE_IMAGE_INVALID_EXTENSION
    );
  });

  it("should have error message profile when image size more than 5MB ", () => {
    //given
    const mockFile = mock<File>();
    const rootStore: RootStore = new RootStore();
    when(mockFile.name).thenReturn("mock.png");
    when(mockFile.size).thenReturn(MAX_IMAGE_BYTE_SIZE + 1);
    const welcomeStore = new WelcomeStore(rootStore);
    expect(welcomeStore.profileImageUrlErrorMessage).toBeUndefined();

    //when
    welcomeStore.changeProfileImage(instance(mockFile));

    //then
    expect(welcomeStore.profileImageUrlErrorMessage).toBe(
      IMAGE_SIZE_EXCEED_MESSAGE
    );
  });
});

export {};
