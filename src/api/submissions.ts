import api from './axios';
import type { ApiResponse, Submission, SubmissionsResponse, SubmissionStatus, TestResult, Difficulty } from '../types';

export interface SubmitCodePayload {
  problemId: string;
  code: string;
  languageId: number;
  language: string;
}

// ── Raw shapes returned by the backend ───────────────────────────

interface RawTestResult {
  id: string;
  passed: boolean;
  stdout?: string;
  expectedOutput?: string;
  executionTime?: number;
  testCase?: { input: string; isHidden: boolean };
}

interface RawFeedback {
  message: string;
}

interface RawSubmission {
  id: string;
  status: SubmissionStatus;
  language: string;
  languageId?: number;
  executionTime?: number;
  createdAt: string;
  code?: string;
  problem?: { id: string; title: string; difficulty?: Difficulty };
  user?: { id: string; name: string };
  userId?: string;
  // GET /submissions/:id and POST /submit return results[]
  results?: RawTestResult[];
  feedback?: RawFeedback | string | null;
}

interface RawSubmissionsResponse {
  submissions: RawSubmission[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

// ── Normalizers ───────────────────────────────────────────────────

function normalizeTestResult(raw: RawTestResult): TestResult {
  return {
    testCaseId: raw.id,
    passed: raw.passed,
    stdout: raw.stdout,
    expectedOutput: raw.expectedOutput,
    input: raw.testCase?.input,
    isHidden: raw.testCase?.isHidden ?? false,
  };
}

function normalizeSubmission(raw: RawSubmission): Submission {
  // feedback can come back as { message } or as a plain string (defensive)
  let feedbackStr: string | undefined;
  if (raw.feedback && typeof raw.feedback === 'object' && 'message' in raw.feedback) {
    feedbackStr = (raw.feedback as RawFeedback).message || undefined;
  } else if (typeof raw.feedback === 'string') {
    feedbackStr = raw.feedback || undefined;
  }

  return {
    id: raw.id,
    status: raw.status,
    language: raw.language,
    languageId: raw.languageId ?? 0,
    executionTime: raw.executionTime,
    createdAt: raw.createdAt,
    code: raw.code ?? '',
    problem: raw.problem,
    problemId: raw.problem?.id ?? '',
    userId: raw.user?.id ?? raw.userId ?? '',
    feedback: feedbackStr,
    testResults: (raw.results ?? []).map(normalizeTestResult),
  };
}

// ── API functions ─────────────────────────────────────────────────

export async function submitCode(payload: SubmitCodePayload): Promise<Submission> {
  const { data } = await api.post<ApiResponse<RawSubmission>>('/submit', payload);
  return normalizeSubmission(data.data);
}

export async function getSubmission(id: string): Promise<Submission> {
  const { data } = await api.get<ApiResponse<RawSubmission>>(`/submissions/${id}`);
  return normalizeSubmission(data.data);
}

export interface UserSubmissionsQuery {
  page?: number;
  limit?: number;
  problemId?: string;
}

export async function getUserSubmissions(
  userId: string,
  query: UserSubmissionsQuery = {}
): Promise<SubmissionsResponse> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.problemId) params.set('problemId', query.problemId);

  const { data } = await api.get<ApiResponse<RawSubmissionsResponse>>(
    `/users/${userId}/submissions?${params}`
  );
  const raw = data.data;
  return {
    submissions: raw.submissions.map(normalizeSubmission),
    total: raw.pagination.total,
    page: raw.pagination.page,
    limit: raw.pagination.limit,
    totalPages: raw.pagination.pages,
  };
}
