import { WelcomeStore } from "@/stores/WelcomeStore";
import { deepEqual, instance, mock, when } from "ts-mockito";
import { Result } from "@/models/common/Result";
import { UserService } from "@/service/user.service";

describe("WelcomeStore.createUser", () => {
  it("success", async () => {
    // given
    const userId = "uid";
    const name = "name";
    const introduce = "intro";
    const tags = ["tag"];
    const stubService: UserService = mock(UserService);
    when(
      stubService.createUser(userId, name, introduce, deepEqual(tags))
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
      stubService.createUser(userId, name, introduce, deepEqual(tags))
    ).thenResolve(Result.errorCatch(error));
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

export {};
