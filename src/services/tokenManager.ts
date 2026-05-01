const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

let accessTokenMemory: string | null = null;

export interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export function getAccessToken(): string | null {
  return accessTokenMemory;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: StoredTokens): void {
  accessTokenMemory = tokens.accessToken;

  if (tokens.accessToken) {
    // Keep legacy storage key for backward compatibility in the app.
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearTokens(): void {
  accessTokenMemory = null;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hydrateAccessTokenFromStorage(): void {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  accessTokenMemory = token;
}
