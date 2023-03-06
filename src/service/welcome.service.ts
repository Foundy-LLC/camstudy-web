import { Result } from "@/models/common/Result";
import { Tag } from "@/models/welcome/Tag";

const HEADER = {
  "Content-Type": "application/json",
};

export class WelcomeService {
  public async getTags(name: string): Promise<Result<Tag[]>> {
    try {
      console.log("test", name);
      const response = await fetch(`api/tags?name=${name}&page=0`, {
        headers: HEADER,
        method: "GET",
      });
      if (response.ok)
        return await Result.createSuccessUsingResponseData(response);
      else return await Result.createErrorUsingResponseMessage(response);
    } catch (e) {
      return Result.createErrorUsingException(e);
    }
  }
}

export const welcomeService = new WelcomeService();
