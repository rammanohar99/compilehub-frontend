import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSubmission } from '../api/submissions';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LANGUAGE_MAP } from '../constants/languages';
import type { SubmissionStatus, TestResult } from '../types';

const STATUS_STYLES: Record<SubmissionStatus, { badge: string; banner: string }> = {
  PASSED: {
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    banner: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
  },
  FAILED: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    banner: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
  },
  ERROR: {
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    banner: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400',
  },
  PENDING: {
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    banner: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400',
  },
  RUNNING: {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    banner: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
  },
};

export function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: submission, isLoading, isError } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => getSubmission(id!),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' || status === 'RUNNING' ? 2000 : false;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-3">
        <p className="text-gray-600 dark:text-gray-300 font-medium">Submission not found</p>
        <Link to="/problems" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
          Back to Problems
        </Link>
      </div>
    );
  }

  const styles = STATUS_STYLES[submission.status];
  const passed = (submission.testResults ?? []).filter((r) => r.passed).length;
  const total = (submission.testResults ?? []).length;
  const lang = LANGUAGE_MAP[submission.languageId];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/problems" className="hover:text-gray-900 dark:hover:text-white transition-colors">Problems</Link>
          {submission.problem && (
            <>
              <span>/</span>
              <Link
                to={`/problems/${submission.problemId}`}
                className="hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {submission.problem.title}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-300">Submission</span>
        </nav>

        {/* Status banner */}
        <div className={`rounded-xl border p-5 ${styles.banner}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${styles.badge}`}>
                  {submission.status}
                </span>
                {total > 0 && (
                  <span className="text-sm opacity-75">
                    {passed} / {total} test cases passed
                  </span>
                )}
              </div>
              {submission.problem && (
                <Link
                  to={`/problems/${submission.problemId}`}
                  className="text-base font-semibold hover:underline"
                >
                  {submission.problem.title}
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm">
              {submission.executionTime != null && (
                <div className="text-center">
                  <p className="font-bold text-lg leading-none">{submission.executionTime}ms</p>
                  <p className="opacity-60 text-xs">Runtime</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetaCard label="Language" value={lang?.name ?? submission.language} />
          <MetaCard label="Submitted" value={formatDate(submission.createdAt)} />
          <MetaCard label="Status" value={submission.status} />
          {submission.executionTime != null && (
            <MetaCard label="Execution Time" value={`${submission.executionTime}ms`} />
          )}
        </div>

        {/* Feedback */}
        {submission.feedback && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Feedback</h3>
            <pre className="text-sm text-red-700 dark:text-red-400 font-mono whitespace-pre-wrap wrap-break-word">
              {submission.feedback}
            </pre>
          </div>
        )}

        {/* Test results table */}
        {total > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Test Case Results</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {submission.testResults!.map((tr, i) => (
                <TestCaseDetail key={tr.testCaseId} result={tr} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Code */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Submitted Code</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {lang?.name ?? submission.language}
            </span>
          </div>
          <pre className="p-4 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto bg-gray-50 dark:bg-gray-800/50 leading-relaxed">
            {submission.code}
          </pre>
        </div>
      </div>
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-white text-sm">{value}</p>
    </div>
  );
}

function TestCaseDetail({ result, index }: { result: TestResult; index: number }) {
  return (
    <div className={`p-4 ${result.passed ? '' : 'bg-red-50/40 dark:bg-red-900/5'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            result.passed
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {result.passed ? 'Passed' : 'Failed'}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {result.isHidden ? `Hidden Test ${index + 1}` : `Test case ${index + 1}`}
        </span>
      </div>

      {!result.isHidden && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          {result.input != null && (
            <div>
              <p className="text-gray-400 uppercase font-sans font-semibold tracking-wider mb-1">Input</p>
              <pre className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                {result.input}
              </pre>
            </div>
          )}
          {result.stdout != null && (
            <div>
              <p className="text-gray-400 uppercase font-sans font-semibold tracking-wider mb-1">Your Output</p>
              <pre className={`rounded p-2 overflow-x-auto whitespace-pre-wrap break-all ${
                result.passed
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                {result.stdout || '(no output)'}
              </pre>
            </div>
          )}
          {result.expectedOutput != null && (
            <div>
              <p className="text-gray-400 uppercase font-sans font-semibold tracking-wider mb-1">Expected</p>
              <pre className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                {result.expectedOutput}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
