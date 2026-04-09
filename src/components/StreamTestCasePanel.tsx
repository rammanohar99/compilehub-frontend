import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { StreamTestCase, StreamResult } from '../hooks/useStreamSubmit';

interface Props {
  testCases: StreamTestCase[];
  status: 'idle' | 'running' | 'done' | 'error';
  result: StreamResult | null;
  error: string | null;
}

export function StreamTestCasePanel({ testCases, status, result, error }: Props) {
  if (status === 'idle') return null;

  const passedCount = testCases.filter((tc) => tc.status === 'passed').length;
  const totalCount = testCases.length;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0 max-h-80 overflow-y-auto">
      {/* Initializing state — before init event arrives */}
      {status === 'running' && totalCount === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          <span>Preparing test cases…</span>
        </div>
      )}

      {/* Test case rows */}
      {totalCount > 0 && (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {testCases.map((tc) => (
            <TestCaseRow key={tc.index} tc={tc} />
          ))}
        </div>
      )}

      {/* Result banner — shown after done */}
      {status === 'done' && result && (
        <ResultBanner
          result={result}
          passedCount={passedCount}
          totalCount={totalCount}
        />
      )}

      {/* Error state */}
      {status === 'error' && error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}

/* ── Individual test case row ───────────────────────────────── */

function TestCaseRow({ tc }: { tc: StreamTestCase }) {
  const [open, setOpen] = useState(false);
  const canExpand = tc.status === 'failed' && !tc.isHidden;

  return (
    <div className="text-xs">
      <button
        onClick={() => canExpand && setOpen((o) => !o)}
        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${
          canExpand ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer' : 'cursor-default'
        }`}
      >
        {/* Status indicator */}
        <StatusDot status={tc.status} isHidden={tc.isHidden} />

        {/* Label */}
        <span className="font-medium text-gray-700 dark:text-gray-300 flex-1">
          {tc.isHidden ? (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-gray-400">
                <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clipRule="evenodd" />
              </svg>
              {tc.label}
            </span>
          ) : (
            tc.label
          )}
        </span>

        {/* Execution time */}
        {tc.executionTime != null && (
          <span className="text-gray-400 dark:text-gray-500 font-mono tabular-nums">
            {tc.executionTime}ms
          </span>
        )}

        {/* Expand chevron for failed non-hidden */}
        {canExpand && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Expanded: Expected vs Got (non-hidden failed only) */}
      {open && canExpand && (
        <div className="px-4 pb-3 pt-1 space-y-2 bg-gray-50/60 dark:bg-gray-800/30">
          {tc.expected != null && (
            <div>
              <p className="text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mb-1">Expected</p>
              <pre className="font-mono text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap">
                {tc.expected}
              </pre>
            </div>
          )}
          {tc.actual != null && (
            <div>
              <p className="text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mb-1">Got</p>
              <pre className="font-mono text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap">
                {tc.actual}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Status dot / spinner ───────────────────────────────────── */

function StatusDot({ status, isHidden }: { status: StreamTestCase['status']; isHidden: boolean }) {
  if (status === 'running') {
    return <Spinner />;
  }

  if (status === 'passed') {
    return (
      <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-green-600 dark:text-green-400">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
        </svg>
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-red-600 dark:text-red-400">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </span>
    );
  }

  // pending
  return (
    <span className={`w-5 h-5 rounded-full border-2 shrink-0 ${
      isHidden
        ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'
        : 'border-gray-300 dark:border-gray-600'
    }`} />
  );
}

function Spinner() {
  return (
    <span className="w-5 h-5 shrink-0 flex items-center justify-center">
      <span className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin block" />
    </span>
  );
}

/* ── Result banner ──────────────────────────────────────────── */

function ResultBanner({
  result,
  passedCount,
  totalCount,
}: {
  result: StreamResult;
  passedCount: number;
  totalCount: number;
}) {
  const allPassed = result.finalStatus === 'PASSED';
  const isError = result.finalStatus === 'ERROR';

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      {/* Main banner */}
      <div
        className={`flex items-center justify-between px-4 py-3 ${
          allPassed
            ? 'bg-green-50 dark:bg-green-900/20'
            : isError
            ? 'bg-orange-50 dark:bg-orange-900/20'
            : 'bg-red-50 dark:bg-red-900/20'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {/* Icon */}
          {allPassed ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 shrink-0 ${isError ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          )}

          {/* Message */}
          <div>
            <p className={`text-sm font-semibold ${
              allPassed
                ? 'text-green-800 dark:text-green-300'
                : isError
                ? 'text-orange-800 dark:text-orange-300'
                : 'text-red-800 dark:text-red-300'
            }`}>
              {allPassed
                ? 'All test cases passed!'
                : isError
                ? 'Runtime Error'
                : `${passedCount} / ${totalCount} test cases passed`}
            </p>
            {result.executionTime != null && (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                {result.executionTime}ms
              </p>
            )}
          </div>

          {/* XP badge — shown on any completed submission */}
          {result.xpAwarded > 0 && (
            <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700">
              +{result.xpAwarded} XP
            </span>
          )}
        </div>

        {/* Full details link */}
        <Link
          to={`/submissions/${result.submissionId}`}
          className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline underline-offset-2 transition-colors"
        >
          Full details
        </Link>
      </div>

      {/* AI Feedback */}
      {result.feedback && (
        <div className="bg-amber-50 dark:bg-amber-900/15 border-t border-amber-200 dark:border-amber-800/40 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-600 dark:text-amber-400">
                <path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.572.729 6.016 6.016 0 002.856 0A.75.75 0 0012 15.1v-.644c0-1.013.763-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">AI Insight</p>
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed font-mono whitespace-pre-wrap">
                {result.feedback}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
