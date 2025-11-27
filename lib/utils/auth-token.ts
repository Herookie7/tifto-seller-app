let cachedAuthToken: string | null = null;

export const setCachedAuthToken = (token: string | null | undefined) => {
  cachedAuthToken = token ?? null;
};

export const getCachedAuthToken = () => cachedAuthToken;

