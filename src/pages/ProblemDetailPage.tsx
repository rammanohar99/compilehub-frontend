import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getProblem } from '../api/problems';
import { submitCode, getSubmission } from '../api/submissions';
import { CodeEditor } from '../components/CodeEditor';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../constants/languages';
import { useAuthStore } from '../store/authStore';
import type { Language, Submission, SubmissionStatus, Difficulty, TestResult } from '../types';

const POLL_INTERVAL = 2000;
const MAX_POLLS = 30;

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  PENDING: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  RUNNING: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  PASSED: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  FAILED: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  ERROR: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
};

export function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);

  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [code, setCode] = useState(DEFAULT_LANGUAGE.defaultCode);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [polling, setPolling] = useState(false);
  const pollCount = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: problem, isLoading, isError } = useQuery({
    queryKey: ['problem', id],
    queryFn: () => getProblem(id!),
    enabled: Boolean(id),
  });

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  function handleLanguageChange(lang: Language) {
    setLanguage(lang);
    setCode(lang.defaultCode);
  }

  const pollSubmission = useCallback(async (submissionId: string) => {
    if (pollCount.current >= MAX_POLLS) {
      setPolling(false);
      setSubmitting(false);
      toast.error('Submission timed out. Please try again.');
      return;
    }

    try {
      const result = await getSubmission(submissionId);
      setSubmission(result);

      if (result.status === 'PENDING' || result.status === 'RUNNING') {
        pollCount.current++;
        pollTimer.current = setTimeout(() => pollSubmission(submissionId), POLL_INTERVAL);
      } else {
        setPolling(false);
        setSubmitting(false);
        if (result.status === 'PASSED') {
          toast.success('All test cases passed! 🎉');
        } else if (result.status === 'FAILED') {
          toast.error('Some test cases failed. Check the AI feedback below.');
        } else {
          toast.error(`Submission ${result.status.toLowerCase()}.`);
        }
      }
    } catch {
      setPolling(false);
      setSubmitting(false);
      toast.error('Failed to fetch submission result.');
    }
  }, []);

  async function handleSubmit() {
    if (!id || !user) return;
    if (!code.trim()) {
      toast.error('Editor is empty. Write some code first.');
      return;
    }

    setSubmitting(true);
    setSubmission(null);
    pollCount.current = 0;

    try {
      const result = await submitCode({
        problemId: id,
        code,
        languageId: language.id,
        language: language.name,
      });
      setSubmission(result);

      if (result.status === 'PENDING' || result.status === 'RUNNING') {
        setPolling(true);
        pollTimer.current = setTimeout(() => pollSubmission(result.id), POLL_INTERVAL);
      } else {
        setSubmitting(false);
        if (result.status === 'PASSED') toast.success('All test cases passed! 🎉');
        else toast.error(`Submission ${result.status.toLowerCase()}.`);
      }
    } catch {
      setSubmitting(false);
      toast.error('Failed to submit. Make sure the backend is running.');
    }
  }

  const isRunning = submitting || polling;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !problem) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-gray-600 dark:text-gray-300 font-medium">Problem not found</p>
        <Link to="/problems" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
          Back to Problems
        </Link>
      </div>
    );
  }

  const visibleTestCases = (problem.testCases ?? []).filter((tc) => !tc.isHidden);

  return (
    <div className="flex h-full overflow-hidden bg-gray-100 dark:bg-gray-950">
      {/* ── LEFT PANEL: Problem Description ── */}
      <div className="w-[420px] xl:w-[480px] shrink-0 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Title + badge */}
          <div>
            <div className="flex items-start gap-3 mb-2">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-snug flex-1">
                {problem.title}
              </h1>
              <DifficultyBadge difficulty={problem.difficulty as Difficulty} />
            </div>

            {/* Companies */}
            {problem.companies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {problem.companies.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

            {/* Tags */}
            {problem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {problem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-code:text-blue-600 dark:prose-code:text-blue-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {problem.description}
            </ReactMarkdown>
          </div>

          {/* Sample test cases */}
          {visibleTestCases.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Examples</h3>
              {visibleTestCases.map((tc, i) => (
                <div
                  key={tc.id}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden text-sm"
                >
                  <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Example {i + 1}
                  </div>
                  <div className="p-3 space-y-2">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Input</span>
                      <pre className="mt-1 text-xs font-mono bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2 overflow-x-auto">
                        {tc.input}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Output</span>
                      <pre className="mt-1 text-xs font-mono bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2 overflow-x-auto">
                        {tc.expectedOutput}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Editor + Results ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Editor toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0">
          {/* Language selector */}
          <div className="relative">
            <select
              value={language.id}
              onChange={(e) => {
                const lang = LANGUAGES.find((l) => l.id === Number(e.target.value));
                if (lang) handleLanguageChange(lang);
              }}
              disabled={isRunning}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            {isRunning ? (
              <>
                <LoadingSpinner size="sm" className="text-white" />
                <span>{polling ? 'Running...' : 'Submitting...'}</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" />
                </svg>
                Submit
              </>
            )}
          </button>
        </div>

        {/* Monaco editor */}
        <div className="flex-1 min-h-0">
          <CodeEditor code={code} language={language} onChange={setCode} />
        </div>

        {/* Submission result panel */}
        {submission && (
          <SubmissionResult submission={submission} polling={polling} />
        )}
      </div>
    </div>
  );
}

/* ── AI Feedback Panel ──────────────────────────────────────── */
function AiFeedbackPanel({ feedback }: { feedback: string }) {
  return (
    <div className="border-t-2 border-orange-400 bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-950/25 dark:to-amber-950/15 p-4">
      <div className="flex items-start gap-3">
        {/* Brain icon */}
        <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-800/50 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5 text-orange-500">
            <path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.572.729 6.016 6.016 0 002.856 0A.75.75 0 0012 15.1v-.644c0-1.013.763-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-bold text-orange-800 dark:text-orange-300">AI Insight</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold bg-orange-200 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300">
              Smart Feedback
            </span>
          </div>
          <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed font-mono whitespace-pre-wrap">
            {feedback}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Submission Result ──────────────────────────────────────── */
function SubmissionResult({ submission, polling }: { submission: Submission; polling: boolean }) {
  const colorClass = STATUS_COLORS[submission.status];
  const passed = (submission.testResults ?? []).filter((r) => r.passed).length;
  const total = (submission.testResults ?? []).length;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 max-h-72 overflow-y-auto shrink-0">
      {/* Status banner */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${colorClass}`}>
        <div className="flex items-center gap-2.5">
          {polling ? (
            <LoadingSpinner size="sm" />
          ) : (
            <StatusIcon status={submission.status} />
          )}
          <span className="font-semibold text-sm">
            {polling
              ? 'Running test cases...'
              : submission.status === 'PASSED'
              ? 'All test cases passed! 🎉'
              : submission.status === 'FAILED'
              ? 'Wrong Answer'
              : submission.status === 'ERROR'
              ? 'Runtime Error'
              : submission.status}
          </span>
          {total > 0 && !polling && (
            <span className="text-xs opacity-70 font-mono">({passed}/{total} passed)</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs opacity-70">
          {submission.executionTime != null && (
            <span className="font-mono">{submission.executionTime}ms</span>
          )}
          <Link
            to={`/submissions/${submission.id}`}
            className="underline hover:no-underline font-medium"
          >
            Full details
          </Link>
        </div>
      </div>

      {/* AI Feedback — highlighted prominently */}
      {submission.feedback && !polling && (
        <AiFeedbackPanel feedback={submission.feedback} />
      )}

      {/* Per-test-case results */}
      {(submission.testResults ?? []).length > 0 && (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {submission.testResults!.map((tr, i) => (
            <TestCaseRow key={tr.testCaseId} result={tr} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function TestCaseRow({ result, index }: { result: TestResult; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
      >
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
            result.passed
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}
        >
          {result.passed ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          )}
        </span>

        <span className="font-medium text-gray-700 dark:text-gray-300">
          {result.isHidden ? `Hidden Test ${index + 1}` : `Test case ${index + 1}`}
        </span>

        {!result.passed && !result.isHidden && (
          <span className="ml-1 text-red-500 dark:text-red-400 text-xs">— see details</span>
        )}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-3.5 h-3.5 text-gray-400 ml-auto transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && !result.isHidden && (
        <div className="px-4 pb-3 pt-1 space-y-2.5 bg-gray-50/60 dark:bg-gray-800/30">
          {result.input != null && (
            <div>
              <p className="text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mb-1 text-xs">Input</p>
              <pre className="font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 overflow-x-auto">{result.input}</pre>
            </div>
          )}
          {result.stdout != null && (
            <div>
              <p className="text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mb-1 text-xs">Your Output</p>
              <pre className={`font-mono text-gray-700 dark:text-gray-300 rounded-lg p-2 overflow-x-auto border ${result.passed ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50'}`}>{result.stdout}</pre>
            </div>
          )}
          {result.expectedOutput != null && (
            <div>
              <p className="text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mb-1 text-xs">Expected</p>
              <pre className="font-mono text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded-lg p-2 overflow-x-auto">{result.expectedOutput}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: SubmissionStatus }) {
  if (status === 'PASSED') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
      </svg>
    );
  }
  if (status === 'FAILED' || status === 'ERROR') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
    </svg>
  );
}
