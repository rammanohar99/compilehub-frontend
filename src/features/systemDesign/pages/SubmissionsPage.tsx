import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DifficultyBadge } from '../../../components/DifficultyBadge';
import { useMySubmissions } from '../hooks/useMySubmissions';
import { SubmissionListSkeleton } from '../components/QuestionListSkeleton';
import type { SystemDesignSubmission } from '../types';

const PAGE_LIMIT = 15;

export function SubmissionsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useMySubmissions({ page, limit: PAGE_LIMIT });

  const submissions = data?.submissions ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Link
              to="/system-design"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              ← System Design
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Submissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {data?.total != null ? `${data.total} submissions` : 'Your system design answers'}
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <SubmissionListSkeleton />
        ) : isError ? (
          <ErrorState />
        ) : submissions.length === 0 ? (
          <EmptyState />
        ) : (
          <SubmissionTable submissions={submissions} />
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionTable({ submissions }: { submissions: SystemDesignSubmission[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Question</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Difficulty</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Submitted</th>
            <th className="px-4 py-3 w-20" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {submissions.map((sub) => (
            <tr key={sub.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
              <td className="px-4 py-3.5">
                <Link
                  to={`/system-design/${sub.question.id}`}
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {sub.question.title}
                </Link>
              </td>
              <td className="px-4 py-3.5">
                <DifficultyBadge difficulty={sub.question.difficulty} />
              </td>
              <td className="px-4 py-3.5 hidden sm:table-cell text-sm text-gray-500 dark:text-gray-400">
                {new Date(sub.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="px-4 py-3.5 text-right">
                <Link
                  to={`/system-design/submissions/${sub.id}`}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center py-20 text-gray-500 dark:text-gray-400">
      <p className="text-base font-medium">Failed to load submissions</p>
      <p className="text-sm mt-1">Make sure the backend is running</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center py-20 text-gray-500 dark:text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-10 h-10 mx-auto mb-3 opacity-40">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-3-3v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-base font-medium">No submissions yet</p>
      <p className="text-sm mt-1">
        <Link to="/system-design" className="text-blue-600 dark:text-blue-400 hover:underline">
          Start solving questions
        </Link>{' '}
        to see your answers here
      </p>
    </div>
  );
}
