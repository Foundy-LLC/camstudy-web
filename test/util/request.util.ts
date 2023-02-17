import { NextApiRequest } from "next";
import { mock, when } from "ts-mockito";

export const createMockRequest = ({
  body,
  query,
}: {
  body?: any;
  query?: any;
}): NextApiRequest => {
  const request = mock<NextApiRequest>();
  when(request.body).thenReturn(body);
  when(request.query).thenReturn(query);
  return request;
};
