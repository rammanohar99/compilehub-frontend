import { create } from 'zustand';
import type { User } from '../types';
import { clearTokens, getAccessToken, getRefreshToken, hydrateAccessTokenFromStorage, setTokens } from '../services/tokenManager';
import { logoutAuth, type AuthData } from '../api/auth';
import toast from 'react-hot-toast';
import { invalidateRefreshFlow, refreshWithLock, setRefreshApplyTokensHandler } from '../services/authRefresh';
const DEV_AUTH_LOGS = import.meta.env.DEV && import.meta.env.VITE_AUTH_DEBUG === 'true';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (authData: AuthData) => void;
  logout: (options?: { allSessions?: boolean }) => Promise<void>;
  clearAuth: () => void;
  bootstrapAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

function loadFromStorage(): { user: User | null; refreshToken: string | null } {
  try {
    const raw = localStorage.getItem('user');
    const refreshToken = getRefreshToken();
    const user: User | null = raw ? (JSON.parse(raw) as User) : null;
    return { user, refreshToken };
  } catch {
    return { user: null, refreshToken: null };
  }
}

hydrateAccessTokenFromStorage();
const { user: initialUser, refreshToken: initialRefreshToken } = loadFromStorage();
const initialAccessToken = getAccessToken();

let bootstrapPromise: Promise<void> | null = null;
let didShowBootstrapExpiryToast = false;

function log(event: string): void {
  if (DEV_AUTH_LOGS) {
    console.debug(`[auth] ${event}`);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
  isAuthenticated: Boolean(initialAccessToken && initialUser),
  isBootstrapping: true,

  login(authData) {
    const accessToken = authData.accessToken || authData.token || null;
    const refreshToken = authData.refreshToken || null;
    localStorage.setItem('user', JSON.stringify(authData.user));
    setTokens({ accessToken, refreshToken });
    didShowBootstrapExpiryToast = false;
    set({ accessToken, refreshToken, user: authData.user, isAuthenticated: Boolean(accessToken && authData.user) });
  },

  async logout(options) {
    invalidateRefreshFlow('logout');
    try {
      const currentRefresh = getRefreshToken();
      if (options?.allSessions) {
        await logoutAuth({ allSessions: true });
      } else if (currentRefresh) {
        await logoutAuth({ refreshToken: currentRefresh });
      }
    } catch {
      // Always clear local auth state even if revoke fails.
    } finally {
      clearTokens();
      localStorage.removeItem('user');
      set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
    }
  },

  clearAuth() {
    invalidateRefreshFlow('clear-auth');
    clearTokens();
    localStorage.removeItem('user');
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
  },

  async bootstrapAuth() {
    if (bootstrapPromise) return bootstrapPromise;

    bootstrapPromise = (async () => {
      log('bootstrap start');
      const refreshToken = getRefreshToken();
      const storedUser = loadFromStorage().user;

      if (!refreshToken || !storedUser) {
        set({ isBootstrapping: false, isAuthenticated: false });
        log('bootstrap finish (no refresh token or user)');
        return;
      }

      const refreshed = await refreshWithLock('bootstrap');
      if (refreshed?.accessToken) {
        didShowBootstrapExpiryToast = false;
        localStorage.setItem('user', JSON.stringify(storedUser));
        set({
          user: storedUser,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          isAuthenticated: true,
          isBootstrapping: false,
        });
        log('bootstrap finish (success)');
        return;
      }

      clearTokens();
      localStorage.removeItem('user');
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isBootstrapping: false });
      if (!didShowBootstrapExpiryToast) {
        toast.error('Session expired, please login again');
        didShowBootstrapExpiryToast = true;
      }
      log('bootstrap finish (failed)');
    })().finally(() => {
      bootstrapPromise = null;
    });

    return bootstrapPromise;
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));

setRefreshApplyTokensHandler(({ accessToken, refreshToken }) => {
  useAuthStore.setState((state) => ({
    ...state,
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(accessToken && state.user),
  }));
});
