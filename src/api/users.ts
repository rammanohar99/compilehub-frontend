import api from './axios';
import type { ApiResponse } from '../types';

// ── Response types ────────────────────────────────────────────────

export interface UserStats {
  xp: number;
  level: number;
  xpToNextLevel: number;
  xpProgress: number;
  streak: number;
  longestStreak: number;
  problemsSolved: number;
  totalSubmissions: number;
  acceptanceRate: number;
  sdAnswersSubmitted: number;
}

export interface ActivityEntry {
  date: string;   // "YYYY-MM-DD"
  count: number;
}

export interface TopicStrengthEntry {
  label: string;
  score: number;
  solved: number;
  total: number;
}

export interface LearningPathTopic {
  label: string;
  done: boolean;
  current: boolean;
  completedAt: string | null;
  solvedCount: number;
  required: number;
}

export interface LearningPath {
  topics: LearningPathTopic[];
  completedCount: number;
  totalCount: number;
}

// ── API functions ─────────────────────────────────────────────────

export async function getUserStats(userId: string): Promise<UserStats> {
  const { data } = await api.get<ApiResponse<UserStats>>(`/users/${userId}/stats`);
  return data.data;
}

export async function getUserActivity(
  userId: string,
  from?: string,
  to?: string,
): Promise<ActivityEntry[]> {
  const sp = new URLSearchParams();
  if (from) sp.set('from', from);
  if (to) sp.set('to', to);
  const query = sp.toString() ? `?${sp}` : '';
  const { data } = await api.get<ApiResponse<{ activity: ActivityEntry[] }>>(
    `/users/${userId}/activity${query}`,
  );
  return data.data.activity;
}

export async function getTopicStrength(
  userId: string,
): Promise<TopicStrengthEntry[]> {
  const { data } = await api.get<ApiResponse<{ topics: TopicStrengthEntry[] }>>(
    `/users/${userId}/topic-strength`,
  );
  return data.data.topics;
}

export async function getLearningPath(userId: string): Promise<LearningPath> {
  const { data } = await api.get<ApiResponse<LearningPath>>(
    `/users/${userId}/learning-path`,
  );
  return data.data;
}
