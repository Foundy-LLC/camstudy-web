const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const fetchAbsolute = async (
  path: RequestInfo | URL,
  init: RequestInit
): Promise<Response> => {
  const url = `${BASE_URL}/${path}`;
  return await fetch(url, init);
};
