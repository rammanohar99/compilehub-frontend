import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getProblem } from '../api/problems';
import { CodeEditor } from '../components/CodeEditor';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StreamTestCasePanel } from '../components/StreamTestCasePanel';
import { useStreamSubmit } from '../hooks/useStreamSubmit';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../constants/languages';
import { useAuthStore } from '../store/authStore';
import type { Language, Difficulty } from '../types';

export function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);

  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [code, setCode] = useState(DEFAULT_LANGUAGE.defaultCode);

  const { testCases, status, result, error, isRunning, submit, reset } = useStreamSubmit();

  const { data: problem, isLoading, isError } = useQuery({
    queryKey: ['problem', id],
    queryFn: () => getProblem(id!),
    enabled: Boolean(id),
  });

  // Toast on completion — depend on result.submissionId so this fires
  // exactly once per result, even if status and result land in separate renders.
  useEffect(() => {
    if (!result) return;
    if (result.finalStatus === 'PASSED') {
      toast.success('All test cases passed!');
    } else if (result.finalStatus === 'FAILED') {
      const passed = testCases.filter((tc) => tc.status === 'passed').length;
      toast.error(`Wrong Answer — ${passed}/${testCases.length} test cases passed`);
    } else {
      toast.error('Runtime Error — check your code for exceptions.');
    }
  }, [result?.submissionId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (status === 'error' && error) toast.error(error);
  }, [status, error]);

  function handleLanguageChange(lang: Language) {
    setLanguage(lang);
    setCode(lang.defaultCode);
  }

  function handleSubmit() {
    if (!id || !user) return;
    if (!code.trim()) {
      toast.error('Editor is empty. Write some code first.');
      return;
    }
    submit({ problemId: id, code, languageId: language.id, language: language.name });
  }

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
      <div className="w-105 xl:w-120 shrink-0 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Title + badge */}
          <div>
            <div className="flex items-start gap-3 mb-2">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-snug flex-1">
                {problem.title}
              </h1>
              <DifficultyBadge difficulty={problem.difficulty as Difficulty} />
            </div>

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
        {/* Toolbar */}
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

          <div className="flex items-center gap-2">
            {/* Reset panel when done */}
            {status !== 'idle' && !isRunning && (
              <button
                onClick={reset}
                className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Clear
              </button>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              {isRunning ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>Running…</span>
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
        </div>

        {/* Monaco editor */}
        <div className="flex-1 min-h-0">
          <CodeEditor code={code} language={language} onChange={setCode} />
        </div>

        {/* Live test case panel */}
        <StreamTestCasePanel
          testCases={testCases}
          status={status}
          result={result}
          error={error}
        />
      </div>
    </div>
  );
}
