import type { Difficulty } from '../../types';

export type QuestionType = 'MCQ' | 'MULTI_SELECT' | 'TRUE_FALSE' | 'SCENARIO_BASED';

export interface AssessmentCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  topicCount: number;
  assessmentCount: number;
}

export interface AssessmentTopic {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  questionCount: number;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string;
  topic?: string;
  difficulty: Difficulty;
  durationMinutes: number;
  questionCount: number;
  totalPoints: number;
  createdAt: string;
}

export type AssessmentAnswerValue = string | string[] | boolean | number;

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  topic?: string;
  options?: string[]; // For MCQ, MULTI_SELECT, TRUE_FALSE
  scenarioContext?: string; // For SCENARIO_BASED
  explanation?: string; // Only available after attempt completion
  correctAnswer?: AssessmentAnswerValue; // Only available after attempt completion
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  difficulty: Difficulty;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  startedAt: string;
  endsAt: string;
  timedMode: boolean;
  completedAt?: string;
  score?: number;
  accuracy?: number;
  totalPoints: number;
  correctAnswersCount?: number;
  assessment: {
    id: string;
    title: string;
    questions: AssessmentQuestion[];
  };
  answerEvents: Record<string, AssessmentAnswerValue>;
}

export interface AssessmentHistoryItem {
  id: string;
  assessmentTitle: string;
  category: string;
  status: string;
  score: number;
  totalPoints: number;
  percentile?: number;
  completedAt: string | null;
  xpAwarded?: number;
  newTotal?: number | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AssessmentCategoriesResponse {
  categories: AssessmentCategory[];
  meta: PaginationMeta;
}

export interface AssessmentTopicsResponse {
  topics: AssessmentTopic[];
  meta: PaginationMeta;
}

export interface AssessmentAttemptResponse {
  attempt: AssessmentAttempt;
}

export interface AssessmentAnalytics {
  totalAttempts: number;
  averageScore: number;
  perfectScores: number;
  categoryBreakdown: Record<string, {
    attempts: number;
    averageScore: number;
  }>;
  recentAttempts: AssessmentHistoryItem[];
}

export interface CreateAssessmentRequest {
  categoryId?: string;
  topicId?: string;
  difficulty: Difficulty;
  questionCount?: number;
  timedMode?: boolean;
}
