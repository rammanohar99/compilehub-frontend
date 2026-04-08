import type { Difficulty } from '../../types';

// Re-export so feature internals only import from here
export type { Difficulty };

// ── Core Domain ───────────────────────────────────────────────────

// Actual shapes returned by the backend for solution sub-fields
export interface SDSolutionStep {
  step: string;
  detail: string;
}

export interface SDSolutionTradeoff {
  aspect: string;
  tradeoff: string;
}

export interface SDSolution {
  overview: string;
  steps: SDSolutionStep[];
  tradeoffs: SDSolutionTradeoff[];
  diagram: Record<string, unknown> | null;
}

export interface SystemDesignQuestion {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  requirements: string[];
  constraints: string[];
  hints: string[];
  solution: SDSolution;
  createdAt: string;
  updatedAt: string;
}

// Shape returned by GET / list — solution & hints excluded
export type SystemDesignQuestionSummary = Omit<SystemDesignQuestion, 'hints' | 'solution'>;

export interface SystemDesignSubmission {
  id: string;
  userId: string;
  questionId: string;
  question: Pick<SystemDesignQuestion, 'id' | 'title' | 'difficulty'>;
  answerText: string;
  createdAt: string;
  updatedAt: string;
}

// ── API Response Shapes ───────────────────────────────────────────

export interface QuestionsListResponse {
  questions: SystemDesignQuestionSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubmissionsListResponse {
  submissions: SystemDesignSubmission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Query / Input Types ───────────────────────────────────────────

export interface QuestionsQuery {
  page?: number;
  limit?: number;
  difficulty?: Difficulty | '';
  search?: string;
}

export interface SDSolutionInput {
  overview: string;
  steps: string[];
  tradeoffs: string[];
  diagram: Record<string, unknown> | null;
}

export interface CreateQuestionInput {
  title: string;
  difficulty: Difficulty;
  description: string;
  requirements: string[];
  constraints: string[];
  hints: string[];
  solution: SDSolutionInput;
}

export type UpdateQuestionInput = Partial<CreateQuestionInput>;

// ── Form State ────────────────────────────────────────────────────

export interface QuestionFormValues {
  title: string;
  difficulty: Difficulty | '';
  description: string;
  requirements: string[];
  constraints: string[];
  hints: string[];
  solution: {
    overview: string;
    steps: string[];
    tradeoffs: string[];
  };
}

export const defaultFormValues: QuestionFormValues = {
  title: '',
  difficulty: '',
  description: '',
  requirements: [''],
  constraints: [''],
  hints: [''],
  solution: {
    overview: '',
    steps: [''],
    tradeoffs: [''],
  },
};
