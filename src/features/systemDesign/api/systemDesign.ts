import axios from 'axios';
import api from '../../../api/axios';
import type { ApiResponse } from '../../../types';
import type {
  SystemDesignQuestion,
  SystemDesignQuestionSummary,
  SystemDesignSubmission,
  QuestionsListResponse,
  SubmissionsListResponse,
  QuestionsQuery,
  CreateQuestionInput,
  UpdateQuestionInput,
} from '../types';

// ── Error helper ──────────────────────────────────────────────────

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (typeof msg === 'string') return msg;
  }
  return 'An unexpected error occurred';
}

// ── Raw wrapper shapes (backend nests inside an extra key) ────────

interface RawQuestionDetailResponse {
  question: SystemDesignQuestion;
}

interface RawQuestionsListResponse {
  questions: SystemDesignQuestionSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Questions ─────────────────────────────────────────────────────

export async function getQuestions(
  params: QuestionsQuery = {},
): Promise<QuestionsListResponse> {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.difficulty) sp.set('difficulty', params.difficulty);
  if (params.search) sp.set('search', params.search);

  const { data } = await api.get<ApiResponse<RawQuestionsListResponse>>(
    `/system-design?${sp}`,
  );
  // Handle both direct and nested shapes defensively
  const raw = data.data;
  return {
    questions: raw.questions ?? [],
    total: raw.total ?? 0,
    page: raw.page ?? 1,
    limit: raw.limit ?? 10,
    totalPages: raw.totalPages ?? 1,
  };
}

export async function getQuestion(id: string): Promise<SystemDesignQuestion> {
  const { data } = await api.get<ApiResponse<RawQuestionDetailResponse>>(
    `/system-design/${id}`,
  );
  // Backend returns { data: { question: {...} } }
  return data.data.question;
}

export async function createQuestion(
  payload: CreateQuestionInput,
): Promise<SystemDesignQuestion> {
  const { data } = await api.post<ApiResponse<SystemDesignQuestion>>(
    '/system-design',
    payload,
  );
  return data.data;
}

export async function updateQuestion(
  id: string,
  payload: UpdateQuestionInput,
): Promise<SystemDesignQuestion> {
  const { data } = await api.put<ApiResponse<SystemDesignQuestion>>(
    `/system-design/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteQuestion(id: string): Promise<void> {
  await api.delete(`/system-design/${id}`);
}

// ── Submissions ───────────────────────────────────────────────────

export async function submitAnswer(
  questionId: string,
  answerText: string,
): Promise<SystemDesignSubmission> {
  const { data } = await api.post<ApiResponse<SystemDesignSubmission>>(
    `/system-design/${questionId}/submit`,
    { answerText },
  );
  return data.data;
}

export async function getMySubmissions(params: {
  page?: number;
  limit?: number;
} = {}): Promise<SubmissionsListResponse> {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));

  const { data } = await api.get<ApiResponse<SubmissionsListResponse>>(
    `/system-design/submissions/me?${sp}`,
  );
  return data.data;
}

export async function getSubmission(
  submissionId: string,
): Promise<SystemDesignSubmission> {
  const { data } = await api.get<ApiResponse<SystemDesignSubmission>>(
    `/system-design/submissions/${submissionId}`,
  );
  return data.data;
}

// Unused-export silencer for tree-shaking consumers
export type { SystemDesignQuestionSummary };
