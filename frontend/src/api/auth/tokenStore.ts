/**
 * Holds the signed-in access token in memory. Empty until the Sign in page exists.
 * The API client reads it for every request.
 */
let accessToken: string | null = null;

export const tokenStore = {
  get(): string | null {
    return accessToken;
  },
  set(token: string | null): void {
    accessToken = token;
  },
};
