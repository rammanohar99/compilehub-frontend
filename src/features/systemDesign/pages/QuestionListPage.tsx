import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useTheme } from '../../../hooks/useTheme';
import { DifficultyBadge } from '../../../components/DifficultyBadge';
import { useQuestions } from '../hooks/useQuestions';
import { useDebounce } from '../hooks/useDebounce';
import type { Difficulty, SystemDesignQuestionSummary } from '../types';

const DIFFICULTIES: { value: string; label: string }[] = [
  { value: '', label: 'All Difficulties' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

const PAGE_LIMIT = 10;

export function QuestionListPage() {
  const user = useAuthStore((s) => s.user);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const difficulty = (searchParams.get('difficulty') ?? '') as Difficulty | '';
  const searchFromUrl = searchParams.get('search') ?? '';

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const debouncedSearch = useDebounce(searchInput, 400);

  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (debouncedSearch) next.set('search', debouncedSearch);
      else next.delete('search');
      next.delete('page');
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useQuestions({
    page,
    limit: PAGE_LIMIT,
    difficulty: difficulty || undefined,
    search: searchFromUrl || undefined,
  });

  const questions = data?.questions ?? [];
  const totalPages = data?.totalPages ?? 1;

  function setPage(n: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (n <= 1) next.delete('page'); else next.set('page', String(n));
      return next;
    }, { replace: true });
  }

  function setDifficulty(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('difficulty', value); else next.delete('difficulty');
      next.delete('page');
      return next;
    }, { replace: true });
  }

  function clearFilters() {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  }

  const hasFilters = Boolean(difficulty || searchFromUrl);

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: isDark ? '#060612' : '#f1f5f9' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              System Design
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {data?.total != null ? `${data.total} questions` : 'Practice system design interviews'}
            </p>
          </div>
          {user?.role === 'ADMIN' && (
            <Link
              to="/system-design/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
              </svg>
              New Question
            </Link>
          )}
        </div>

        {/* Filters */}
        <div
          className="flex flex-wrap gap-3 mb-6 p-4 rounded-2xl border"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
          }}
        >
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={`px-3 py-2 text-sm rounded-xl border outline-none transition-colors ${
              isDark
                ? 'bg-gray-800/60 border-gray-700/50 text-gray-200 focus:border-indigo-500/50'
                : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-indigo-400'
            }`}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>

          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search questions..."
            className={`px-3 py-2 text-sm rounded-xl border outline-none transition-colors w-56 ${
              isDark
                ? 'bg-gray-800/60 border-gray-700/50 text-gray-200 placeholder-gray-600 focus:border-indigo-500/50'
                : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-indigo-400'
            }`}
          />

          <Link
            to="/system-design/submissions"
            className={`px-3 py-2 text-sm rounded-xl border font-medium transition-colors ${
              isDark
                ? 'border-gray-700/50 text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                : 'border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            My Submissions
          </Link>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
                isDark
                  ? 'border-gray-700/50 text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <TableSkeleton isDark={isDark} />
        ) : isError ? (
          <StateCard>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Failed to load questions</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Make sure the backend is running</p>
          </StateCard>
        ) : questions.length === 0 ? (
          <StateCard>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No questions found</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              {hasFilters ? 'Try adjusting your filters' : 'No system design questions yet'}
            </p>
          </StateCard>
        ) : (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
            }}
          >
            <table className="w-full">
              <thead>
                <tr
                  className="border-b text-[10px] font-bold uppercase tracking-[0.1em]"
                  style={{
                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
                    color: isDark ? '#4b5563' : '#9ca3af',
                    background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.02)',
                  }}
                >
                  <th className="text-left px-5 py-3.5 w-12">#</th>
                  <th className="text-left px-5 py-3.5">Title</th>
                  <th className="text-left px-5 py-3.5 w-28">Difficulty</th>
                  <th className="text-left px-5 py-3.5 hidden md:table-cell">Date Added</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q: SystemDesignQuestionSummary, idx: number) => (
                  <QuestionRow key={q.id} q={q} idx={idx} page={page} pageLimit={PAGE_LIMIT} isDark={isDark} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-4 py-2 text-sm rounded-xl border font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark
                    ? 'border-gray-700/50 text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`px-4 py-2 text-sm rounded-xl border font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark
                    ? 'border-gray-700/50 text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
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

function QuestionRow({
  q, idx, page, pageLimit, isDark,
}: {
  q: SystemDesignQuestionSummary;
  idx: number;
  page: number;
  pageLimit: number;
  isDark: boolean;
}) {
  return (
    <tr
      className="group border-b last:border-0 transition-colors"
      style={{ borderColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = isDark
          ? 'rgba(99,102,241,0.04)'
          : 'rgba(99,102,241,0.03)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      <td className={`px-5 py-4 text-xs font-mono ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
        {(page - 1) * pageLimit + idx + 1}
      </td>
      <td className="px-5 py-4">
        <Link
          to={`/system-design/${q.id}`}
          className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'}`}
        >
          {q.title}
        </Link>
      </td>
      <td className="px-5 py-4">
        <DifficultyBadge difficulty={q.difficulty} />
      </td>
      <td className={`px-5 py-4 hidden md:table-cell text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
        {new Date(q.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
}

function TableSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="rounded-2xl border p-5 space-y-3"
      style={{
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center animate-pulse">
          <div className="w-6 h-3 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1 h-3 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="w-16 h-5 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="w-20 h-3 rounded bg-gray-200 dark:bg-gray-800 hidden md:block" />
        </div>
      ))}
    </div>
  );
}

function StateCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border py-20 text-center"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      {children}
    </div>
  );
}
