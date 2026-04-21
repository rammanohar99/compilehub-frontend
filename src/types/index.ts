// ── Auth ──────────────────────────────────────────────────────────
export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

// ── Problems ──────────────────────────────────────────────────────
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  companies: string[];
  tags: string[];
  testCases?: TestCase[];
  createdAt: string;
  _count?: { submissions: number };
}

export interface ProblemsResponse {
  problems: Problem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Submissions ───────────────────────────────────────────────────
export type SubmissionStatus = 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'ERROR';

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  input?: string;
  stdout?: string;
  expectedOutput?: string;
  stderr?: string;
  isHidden: boolean;
}

export interface Submission {
  id: string;
  problemId: string;
  problem?: { id: string; title: string; difficulty?: Difficulty };
  userId: string;
  code: string;
  language: string;
  languageId: number;
  status: SubmissionStatus;
  executionTime?: number;
  feedback?: string;
  testResults?: TestResult[];
  createdAt: string;
}

export interface SubmissionsResponse {
  submissions: Submission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Code Editor (legacy / run page) ──────────────────────────────
export interface Language {
  id: number;
  name: string;
  monacoId: string;
  defaultCode: string;
}

export interface RunCodeRequest {
  code: string;
  languageId: number;
  stdin?: string;
}

export interface RunCodeResponse {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  executionTime: number | null;
  statusDescription: string;
  statusId: number;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  compileOutput: string;
  time: string | null;
  statusDescription: string;
  statusId: number;
}

// ── API wrapper ───────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
