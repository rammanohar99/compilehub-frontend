import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getUserSubmissions } from '../api/submissions';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Submission, SubmissionStatus } from '../types';

const STATUS_BADGE: Record<SubmissionStatus, string> = {
  PASSED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ERROR: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  RUNNING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const PAGE_LIMIT = 15;

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [filterProblemId, setFilterProblemId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['user-submissions', user?.id, { page, problemId: filterProblemId }],
    queryFn: () =>
      getUserSubmissions(user!.id, {
        page,
        limit: PAGE_LIMIT,
        problemId: filterProblemId || undefined,
      }),
    enabled: Boolean(user?.id),
    placeholderData: (prev) => prev,
  });

  const submissions = data?.submissions ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Compute stats from ALL submissions fetched so far (page 1 data)
  const total = data?.total ?? 0;
  const passedCount = submissions.filter((s) => s.status === 'PASSED').length;
  const passRate = total > 0 ? Math.round((passedCount / submissions.length) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-white">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                {user?.role === 'ADMIN' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Submissions" value={String(total)} />
          <StatCard label="Accepted" value={String(passedCount)} accent="green" />
          <StatCard label="Acceptance Rate" value={`${passRate}%`} accent="blue" />
        </div>

        {/* Submission history */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-semibold text-gray-900 dark:text-white">Submission History</h2>
            <input
              type="text"
              value={filterProblemId}
              onChange={(e) => { setFilterProblemId(e.target.value); setPage(1); }}
              placeholder="Filter by problem ID..."
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <p className="font-medium">No submissions yet</p>
              <Link to="/problems" className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-1 inline-block">
                Solve your first problem
              </Link>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Problem</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Language</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Runtime</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {submissions.map((sub: Submission) => (
                    <tr key={sub.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3.5">
                        {sub.problem ? (
                          <Link
                            to={`/problems/${sub.problemId}`}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {sub.problem.title}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500">{sub.problemId}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Link to={`/submissions/${sub.id}`}>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[sub.status]}`}>
                            {sub.status}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell text-sm text-gray-600 dark:text-gray-400">
                        {sub.language}
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {sub.executionTime != null ? `${sub.executionTime}ms` : '—'}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-sm text-gray-500 dark:text-gray-500">
                        {formatRelative(sub.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'green' | 'blue';
}) {
  const accentClass =
    accent === 'green'
      ? 'text-green-600 dark:text-green-400'
      : accent === 'blue'
      ? 'text-blue-600 dark:text-blue-400'
      : 'text-gray-900 dark:text-white';
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center shadow-sm">
      <p className={`text-2xl font-bold ${accentClass}`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function formatRelative(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

