import axios from 'axios';
import type { RunCodeRequest, RunCodeResponse, ExecutionResult } from '../types';

const BASE_URL = 'http://localhost:5000';

export async function runCode(request: RunCodeRequest): Promise<ExecutionResult> {
  const { data } = await axios.post<RunCodeResponse>(`${BASE_URL}/run`, request, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
  });

  return {
    stdout: data.stdout ?? '',
    stderr: data.stderr ?? '',
    // compile_output is produced by the compiler itself (e.g. C++ syntax errors).
    // It is distinct from runtime stderr and needs its own UI treatment.
    compileOutput: data.compile_output ?? data.message ?? '',
    time: data.time ?? null,
    statusDescription: data.status?.description ?? 'Unknown',
    statusId: data.status?.id ?? 0,
  };
}
