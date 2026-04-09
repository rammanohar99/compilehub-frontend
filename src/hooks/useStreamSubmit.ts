import { useState, useCallback, useRef } from 'react';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

export interface StreamTestCase {
  index: number;
  label: string;
  isHidden: boolean;
  status: 'pending' | 'running' | 'passed' | 'failed';
  executionTime?: number;
  actual?: string;
  expected?: string;
}

export interface StreamResult {
  submissionId: string;
  finalStatus: 'PASSED' | 'FAILED' | 'ERROR';
  executionTime: number | null;
  xpAwarded: number;
  newTotal: number;
  feedback: string | null;
}

export interface SubmitOptions {
  problemId: string;
  code: string;
  languageId: number;
  language: string;
}

interface State {
  testCases: StreamTestCase[];
  status: 'idle' | 'running' | 'done' | 'error';
  result: StreamResult | null;
  error: string | null;
  isRunning: boolean;
}

const INITIAL: State = {
  testCases: [],
  status: 'idle',
  result: null,
  error: null,
  isRunning: false,
};

export function useStreamSubmit() {
  const [state, setState] = useState<State>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);

  const submit = useCallback(async (opts: SubmitOptions) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ testCases: [], status: 'running', result: null, error: null, isRunning: true });

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${BASE_URL}/submit/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(opts),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? `Server error ${res.status}`);
      }

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      const dispatch = (eventName: string, data: Record<string, unknown>) => {
        setState((prev) => {
          switch (eventName) {
            case 'init': {
              const tcs = (
                data.testCases as Array<{ index: number; label: string; isHidden: boolean }>
              ).map((tc) => ({ ...tc, status: 'pending' as const }));
              return { ...prev, testCases: tcs };
            }

            case 'running':
              return {
                ...prev,
                testCases: prev.testCases.map((tc) =>
                  tc.index === data.index ? { ...tc, status: 'running' as const } : tc
                ),
              };

            case 'result':
              return {
                ...prev,
                testCases: prev.testCases.map((tc) =>
                  tc.index === data.index
                    ? {
                        ...tc,
                        status: data.passed ? ('passed' as const) : ('failed' as const),
                        executionTime: (data.executionTime as number | null) ?? undefined,
                        actual: data.actual as string | undefined,
                        expected: data.expected as string | undefined,
                      }
                    : tc
                ),
              };

            case 'done':
              return {
                ...prev,
                status: 'done' as const,
                isRunning: false,
                result: {
                  submissionId: data.submissionId as string,
                  finalStatus: data.status as 'PASSED' | 'FAILED' | 'ERROR',
                  executionTime: data.executionTime as number | null,
                  xpAwarded: (data.xpAwarded as number) ?? 0,
                  newTotal: (data.newTotal as number) ?? 0,
                  feedback: (data.feedback as string | null) ?? null,
                },
              };

            case 'error':
              return {
                ...prev,
                status: 'error' as const,
                isRunning: false,
                error: data.message as string,
              };

            default:
              return prev;
          }
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trimEnd(); // strip trailing \r
          if (trimmed === '') {
            currentEvent = ''; // blank line = end of SSE event block
          } else if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.slice(6).trim();
          } else if (trimmed.startsWith('data:')) {
            try {
              const payload = JSON.parse(trimmed.slice(5).trim()) as Record<string, unknown>;
              dispatch(currentEvent, payload);
            } catch {
              // skip malformed JSON
            }
          }
        }
      }

      // Stream closed without a done/error event (unexpected disconnect)
      setState((prev) => {
        if (prev.status === 'running') {
          return { ...prev, status: 'error', isRunning: false, error: 'Connection closed unexpectedly.' };
        }
        return prev;
      });
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') return;
      setState((prev) => ({
        ...prev,
        status: 'error',
        isRunning: false,
        error: (err as Error).message ?? 'Submission failed',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL);
  }, []);

  return { ...state, submit, reset };
}
