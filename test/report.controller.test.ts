import { mockPrisma } from "./mockPrisma";
import { createMockRequest } from "./util/request.util";
import { instance, mock, verify, when } from "ts-mockito";
import { NextApiResponse } from "next";
import { ReportPostRequestBody } from "@/models/report/ReportPostRequestBody";
import { ReportCategory } from "@/models/report/ReportCategory";
import { postReport } from "@/controller/report.controller";
import { user_account } from ".prisma/client";

describe("postReport", () => {
  const fakeRequest = new ReportPostRequestBody(
    "suspect",
    "reporter",
    ReportCategory.hindrance,
    "content"
  );

  it("success", async () => {
    // when
    mockPrisma.user_account.findUnique.mockResolvedValue({} as user_account);
    const request = createMockRequest({
      body: fakeRequest,
    });
    const response = mock<NextApiResponse>();
    when(response.status(201)).thenReturn(response);

    // when
    await postReport(instance(request), instance(response));

    // then
    verify(response.status(201)).once();
  });

  it("should response 404 error when suspect was not found", async () => {
    // when
    mockPrisma.user_account.findUnique.mockResolvedValueOnce(
      {} as user_account
    );
    mockPrisma.user_account.findUnique.mockResolvedValueOnce(null);
    const request = createMockRequest({
      body: fakeRequest,
    });
    const response = mock<NextApiResponse>();
    when(response.status(404)).thenReturn(response);

    // when
    await postReport(instance(request), instance(response));

    // then
    verify(response.status(404)).once();
  });

  it("should response 404 error when reporter was not found", async () => {
    // when
    mockPrisma.user_account.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user_account.findUnique.mockResolvedValueOnce(
      {} as user_account
    );
    const request = createMockRequest({
      body: fakeRequest,
    });
    const response = mock<NextApiResponse>();
    when(response.status(404)).thenReturn(response);

    // when
    await postReport(instance(request), instance(response));

    // then
    verify(response.status(404)).once();
  });
});

export {};
