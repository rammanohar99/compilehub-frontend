import axios from 'axios';
import { getRefreshToken, setTokens } from './tokenManager';

interface RefreshPayload {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}

interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

type ApplyTokensHandler = (tokens: RefreshResult) => void;

const DEV_AUTH_LOGS = import.meta.env.DEV && import.meta.env.VITE_AUTH_DEBUG === 'true';

let refreshPromise: Promise<RefreshResult | null> | null = null;
let refreshGeneration = 0;
let applyTokensHandler: ApplyTokensHandler | null = null;

function log(event: string): void {
  if (DEV_AUTH_LOGS) {
    console.debug(`[auth] ${event}`);
  }
}

export function setRefreshApplyTokensHandler(handler: ApplyTokensHandler): void {
  applyTokensHandler = handler;
}

export function invalidateRefreshFlow(reason: string): void {
  refreshGeneration += 1;
  log(`refresh invalidated (${reason})`);
}

function mapTokens(payload: RefreshPayload, fallbackRefreshToken: string): RefreshResult | null {
  const accessToken = payload.accessToken || payload.token || null;
  const refreshToken = payload.refreshToken || fallbackRefreshToken;
  if (!accessToken) return null;
  return { accessToken, refreshToken };
}

export async function refreshWithLock(source: 'bootstrap' | 'interceptor'): Promise<RefreshResult | null> {
  if (refreshPromise) {
    log(`refresh join (${source})`);
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      log(`refresh skipped (${source}): no refresh token`);
      return null;
    }

    const requestGeneration = refreshGeneration;
    log(`refresh start (${source})`);

    try {
      const baseURL = import.meta.env.VITE_API_URL ?? '/api';
      const { data } = await axios.post(
        `${baseURL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      if (requestGeneration !== refreshGeneration) {
        log(`refresh ignored (${source}): generation changed`);
        return null;
      }

      const payload = (data?.data ?? data) as RefreshPayload;
      const nextTokens = mapTokens(payload, refreshToken);
      if (!nextTokens) {
        log(`refresh failed (${source}): missing access token`);
        return null;
      }

      // Persist tokens atomically before unblocking waiting callers.
      setTokens(nextTokens);
      applyTokensHandler?.(nextTokens);
      log(`refresh success (${source})`);
      return nextTokens;
    } catch {
      log(`refresh fail (${source})`);
      return null;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
