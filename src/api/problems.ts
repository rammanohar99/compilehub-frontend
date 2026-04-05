import api from './axios';
import type { ApiResponse, Problem, ProblemsResponse, TestCase } from '../types';

export interface ProblemsQuery {
  difficulty?: string;
  company?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

// Raw shape returned by the backend (pagination is a nested object)
interface RawProblemsResponse {
  problems: Problem[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export async function getProblems(query: ProblemsQuery = {}): Promise<ProblemsResponse> {
  const params = new URLSearchParams();
  if (query.difficulty) params.set('difficulty', query.difficulty);
  if (query.company) params.set('company', query.company);
  if (query.tag) params.set('tag', query.tag);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));

  const { data } = await api.get<ApiResponse<RawProblemsResponse>>(`/problems?${params}`);
  const raw = data.data;
  return {
    problems: raw.problems,
    total: raw.pagination.total,
    page: raw.pagination.page,
    limit: raw.pagination.limit,
    totalPages: raw.pagination.pages,
  };
}

export async function getProblem(id: string): Promise<Problem> {
  const { data } = await api.get<ApiResponse<Problem>>(`/problems/${id}`);
  return data.data;
}

export interface CreateProblemPayload {
  title: string;
  description: string;
  difficulty: string;
  companies: string[];
  tags: string[];
}

export async function createProblem(payload: CreateProblemPayload): Promise<Problem> {
  const { data } = await api.post<ApiResponse<Problem>>('/problems', payload);
  return data.data;
}

export interface AddTestCasesPayload {
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
}

export async function addTestCases(
  problemId: string,
  payload: AddTestCasesPayload
): Promise<TestCase[]> {
  const { data } = await api.post<ApiResponse<TestCase[]>>(
    `/problems/${problemId}/testcases`,
    payload
  );
  return data.data;
}
