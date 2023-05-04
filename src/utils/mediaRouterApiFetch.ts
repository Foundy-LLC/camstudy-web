const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const PORT_NUM = process.env.NEXT_PUBLIC_PORT_NUM;

export const mediaRouterApiFetch = async (
  path: RequestInfo | URL,
  init: RequestInit
): Promise<Response> => {
  const url = `${BASE_URL}:${PORT_NUM}/media-router/${path}`;
  return await fetch(url, init);
};
