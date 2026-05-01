import api from './axios';
import type { ApiResponse, User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthData {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresIn?: string;
  refreshTokenExpiresAt?: string;
  user: User;
}

export interface SessionInfo {
  id: string;
  createdAt: string;
  expiresAt: string;
  current?: boolean;
  userAgent?: string;
  ip?: string;
}

export interface AuthTokensResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresIn?: string;
  refreshTokenExpiresAt?: string;
}

export async function login(payload: LoginPayload): Promise<AuthData> {
  const { data } = await api.post<ApiResponse<AuthData>>('/auth/login', payload);
  return data.data;
}

export async function signup(payload: SignupPayload): Promise<AuthData> {
  const { data } = await api.post<ApiResponse<AuthData>>('/auth/signup', payload);
  return data.data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<ApiResponse<User>>('/auth/me');
  return data.data;
}

export async function refreshAuth(refreshToken: string): Promise<AuthTokensResponse> {
  const { data } = await api.post<ApiResponse<AuthTokensResponse>>('/auth/refresh', { refreshToken });
  return data.data;
}

export async function logoutAuth(payload: { refreshToken?: string; allSessions?: boolean }): Promise<void> {
  await api.post('/auth/logout', payload);
}

export async function getSessions(): Promise<SessionInfo[]> {
  const { data } = await api.get<ApiResponse<SessionInfo[] | { sessions?: SessionInfo[] }>>('/auth/sessions');
  const payload = data.data;
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.sessions)) return payload.sessions;
  return [];
}

export async function revokeSession(id: string): Promise<void> {
  await api.delete(`/auth/sessions/${id}`);
}
