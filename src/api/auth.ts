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
  token: string;
  user: User;
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
