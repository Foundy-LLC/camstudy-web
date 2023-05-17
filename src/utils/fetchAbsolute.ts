const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const fetchAbsolute = async (
  path: RequestInfo | URL,
  init: RequestInit
): Promise<Response> => {
  const url = `${BASE_URL}/${path}`;
  return await fetch(url, init);
};

export const mediaRouterApiFetch = async (
  path: RequestInfo | URL,
  init: RequestInit
): Promise<Response> => {
  const url = `${BASE_URL}/media-router/${path}`;
  return await fetch(url, init);
};

export const rankingApiFetch = async (
  path: RequestInfo | URL,
  init: RequestInit
): Promise<Response> => {
  const url = `${BASE_URL}/rank-server/${path}`;
  return await fetch(url, init);
};
