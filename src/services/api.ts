import api from "../api/axios";
import type { ApiResponse, RunCodeRequest, RunCodeResponse, ExecutionResult } from "../types";

export async function runCode(request: RunCodeRequest): Promise<ExecutionResult> {
  const { data } = await api.post<ApiResponse<RunCodeResponse>>("/run", request);
  const result = data.data;

  // Backend doesn't return a numeric statusId — derive it from statusDescription
  // so the OutputPanel StatusBadge renders correctly.
  // Judge0 statusId 3 = Accepted, anything > 3 = error/wrong answer.
  const statusId = deriveStatusId(result.statusId, result.statusDescription);

  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    compileOutput: result.compileOutput ?? "",
    time: result.executionTime != null ? String(result.executionTime) : null,
    statusDescription: result.statusDescription ?? "Unknown",
    statusId,
  };
}

/**
 * The backend may omit statusId. Derive it from statusDescription so the
 * OutputPanel can show the correct badge colour.
 *   3  = Accepted
 *   6  = Compilation Error
 *   11 = Runtime Error (generic fallback for any other error)
 */
function deriveStatusId(raw: number | undefined | null, description: string): number {
  if (raw != null && raw > 0) return raw;
  const d = (description ?? "").toLowerCase();
  if (d === "accepted") return 3;
  if (d.includes("compile")) return 6;
  return 11; // runtime / generic error
}
