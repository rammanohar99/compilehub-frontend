export interface Language {
  id: number;
  name: string;
  monacoId: string;
  defaultCode: string;
}

export interface RunCodeRequest {
  source_code: string;
  language_id: number;
}

export interface RunCodeResponse {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  compileOutput: string;
  time: string | null;
  statusDescription: string;
  statusId: number;
}
