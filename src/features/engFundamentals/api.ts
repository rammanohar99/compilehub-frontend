import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import type { ApiResponse } from '../../types';
import type {
  TopicsResponse,
  FundamentalTopic,
  ScenariosResponse,
  ScenariosQuery,
  AttemptResult,
  ProjectPrepSession,
  CommTemplate,
  EngProgress,
  Difficulty,
} from './types';

// ── Query key factory ─────────────────────────────────────────────

export const engKeys = {
  topics:        () => ['fundamentals', 'topics']       as const,
  topic:  (id: string) => ['fundamentals', 'topics', id] as const,
  scenarios: (p: ScenariosQuery) => ['fundamentals', 'scenarios', p] as const,
  sessions:      () => ['fundamentals', 'project-prep', 'sessions'] as const,
  templates:     () => ['fundamentals', 'templates']    as const,
  progress:      () => ['fundamentals', 'progress']     as const,
};

// ── Re-export Difficulty for convenience ──────────────────────────

export type { Difficulty };

// Add ScenariosQuery to the export set so the page can import it
export type { ScenariosQuery };

// ── API helpers ───────────────────────────────────────────────────

async function fetchTopics(): Promise<TopicsResponse> {
  const { data } = await api.get<ApiResponse<TopicsResponse>>('/fundamentals/topics');
  return data.data;
}

async function fetchTopic(id: string): Promise<FundamentalTopic> {
  const { data } = await api.get<ApiResponse<{ topic: FundamentalTopic }>>(
    `/fundamentals/topics/${id}`,
  );
  return data.data.topic;
}

async function completeTopic(
  id: string,
): Promise<{ completed: boolean; topicId: string; completedAt: string }> {
  const { data } = await api.post<
    ApiResponse<{ completed: boolean; topicId: string; completedAt: string }>
  >(`/fundamentals/topics/${id}/complete`);
  return data.data;
}

async function uncompleteTopic(id: string): Promise<void> {
  await api.delete(`/fundamentals/topics/${id}/complete`);
}

async function fetchScenarios(params: ScenariosQuery = {}): Promise<ScenariosResponse> {
  const sp = new URLSearchParams();
  if (params.difficulty) sp.set('difficulty', params.difficulty);
  if (params.page)       sp.set('page',       String(params.page));
  if (params.limit)      sp.set('limit',      String(params.limit));
  const { data } = await api.get<ApiResponse<ScenariosResponse>>(
    `/fundamentals/scenarios?${sp}`,
  );
  return data.data;
}

async function submitAttempt(
  scenarioId: string,
  picked: number,
): Promise<AttemptResult> {
  const { data } = await api.post<ApiResponse<AttemptResult>>(
    `/fundamentals/scenarios/${scenarioId}/attempt`,
    { picked },
  );
  return data.data;
}

async function generateSession(
  description: string,
): Promise<ProjectPrepSession> {
  const { data } = await api.post<ApiResponse<ProjectPrepSession & { sessionId: string }>>(
    '/fundamentals/project-prep',
    { description },
  );
  // Normalise: backend returns sessionId as top-level alias for id
  const raw = data.data;
  return { id: raw.sessionId ?? raw.id, description: raw.description, questions: raw.questions, createdAt: raw.createdAt };
}

async function fetchSessions(): Promise<{ sessions: ProjectPrepSession[] }> {
  const { data } = await api.get<ApiResponse<{ sessions: ProjectPrepSession[] }>>(
    '/fundamentals/project-prep',
  );
  return data.data;
}

async function deleteSession(id: string): Promise<void> {
  await api.delete(`/fundamentals/project-prep/${id}`);
}

async function fetchTemplates(): Promise<CommTemplate[]> {
  const { data } = await api.get<ApiResponse<{ templates: CommTemplate[] }>>(
    '/fundamentals/templates',
  );
  return data.data.templates;
}

async function markTemplateViewed(id: string): Promise<void> {
  await api.post(`/fundamentals/templates/${id}/view`);
}

async function fetchProgress(): Promise<EngProgress> {
  const { data } = await api.get<ApiResponse<EngProgress>>('/fundamentals/progress');
  return data.data;
}

// ── React Query hooks ─────────────────────────────────────────────

export function useTopics() {
  return useQuery({
    queryKey: engKeys.topics(),
    queryFn: fetchTopics,
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: engKeys.topic(id),
    queryFn: () => fetchTopic(id),
    enabled: Boolean(id),
  });
}

export function useCompleteTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeTopic,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: engKeys.topics() });
      qc.invalidateQueries({ queryKey: engKeys.progress() });
    },
  });
}

export function useUncompleteTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uncompleteTopic,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: engKeys.topics() });
      qc.invalidateQueries({ queryKey: engKeys.progress() });
    },
  });
}

export function useScenarios(params: ScenariosQuery = {}) {
  return useQuery({
    queryKey: engKeys.scenarios(params),
    queryFn: () => fetchScenarios(params),
    placeholderData: (prev) => prev,
  });
}

export function useSubmitAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ scenarioId, picked }: { scenarioId: string; picked: number }) =>
      submitAttempt(scenarioId, picked),
    onSuccess: () => {
      // Refresh list so attempted/correct flags and revealed fields update
      qc.invalidateQueries({ queryKey: ['fundamentals', 'scenarios'] });
      qc.invalidateQueries({ queryKey: engKeys.progress() });
    },
  });
}

export function useProjectSessions() {
  return useQuery({
    queryKey: engKeys.sessions(),
    queryFn: fetchSessions,
    select: (d) => d.sessions,
  });
}

export function useGenerateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (description: string) => generateSession(description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: engKeys.sessions() });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: engKeys.sessions() });
    },
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: engKeys.templates(),
    queryFn: fetchTemplates,
  });
}

export function useViewTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markTemplateViewed,
    // Optimistic update: flip viewedByMe immediately without a round-trip
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: engKeys.templates() });
      const prev = qc.getQueryData<CommTemplate[]>(engKeys.templates());
      qc.setQueryData<CommTemplate[]>(engKeys.templates(), (old) =>
        old?.map((t) => (t.id === id ? { ...t, viewedByMe: true } : t)) ?? [],
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(engKeys.templates(), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: engKeys.progress() });
    },
  });
}

export function useEngProgress() {
  return useQuery({
    queryKey: engKeys.progress(),
    queryFn: fetchProgress,
  });
}
