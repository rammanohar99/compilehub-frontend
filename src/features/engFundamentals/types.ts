// ── Core ─────────────────────────────────────────────────────────

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

// ── Fundamentals (Topics) ─────────────────────────────────────────

export interface TopicConcept {
  id: string;
  topicId: string;
  title: string;
  body: string; // markdown
  order: number;
}

export interface TopicQnA {
  id: string;
  topicId: string;
  question: string;
  answer: string; // markdown
  order: number;
}

export interface TopicQuiz {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  order: number;
}

export interface FundamentalTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  accentColor: string;
  borderColor: string;
  glowColor: string;
  order: number;
  isPublished: boolean;
  concepts: TopicConcept[];
  qna: TopicQnA[];
  quiz: TopicQuiz[];
  createdAt: string;
  updatedAt: string;
}

export interface TopicsResponse {
  topics: FundamentalTopic[];
  completedTopicIds: string[];
}

// ── Debugging Lab ─────────────────────────────────────────────────

export interface DebugScenario {
  id: string;
  title: string;
  description: string; // markdown
  difficulty: Difficulty;
  hypotheses: string[];
  order: number;
  attempted: boolean;
  correct: boolean | null;
  // only present after user has submitted an attempt
  correctIndex?: number;
  explanation?: string; // markdown
  createdAt: string;
}

export interface ScenariosQuery {
  difficulty?: Difficulty | '';
  page?: number;
  limit?: number;
}

export interface ScenariosResponse {
  items: DebugScenario[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AttemptResult {
  correct: boolean;
  correctIndex: number;
  explanation: string;
}

// ── Project Prep ──────────────────────────────────────────────────

export interface ProjectPrepQuestions {
  architecture: string[];
  tradeoffs: string[];
  scaling: string[];
}

export interface ProjectPrepSession {
  id: string;
  description: string;
  questions: ProjectPrepQuestions;
  createdAt: string;
}

// ── Communication ─────────────────────────────────────────────────

export interface CommTemplateStep {
  label: string;
  detail: string;
}

export interface CommTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: CommTemplateStep[];
  example: string; // markdown
  order: number;
  isPublished: boolean;
  viewedByMe: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Progress ──────────────────────────────────────────────────────

export interface EngProgress {
  fundamentals: {
    totalTopics: number;
    completedTopics: number;
    completedIds: string[];
  };
  debugging: {
    totalScenarios: number;
    attempted: number;
    solved: number;
    byDifficulty: {
      EASY: { attempted: number; solved: number };
      MEDIUM: { attempted: number; solved: number };
      HARD: { attempted: number; solved: number };
    };
  };
  projectPrep: {
    totalSessions: number;
    lastSession: { id: string; createdAt: string } | null;
  };
  communication: {
    totalTemplates: number;
    viewed: number;
    viewedIds: string[];
  };
}
