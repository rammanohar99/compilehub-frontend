import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { DifficultyBadge } from '../../../components/DifficultyBadge';
import { useQuestions } from '../hooks/useQuestions';
import { useDebounce } from '../hooks/useDebounce';
import { QuestionListSkeleton } from '../components/QuestionListSkeleton';
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
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const difficulty = (searchParams.get('difficulty') ?? '') as Difficulty | '';
  const searchFromUrl = searchParams.get('search') ?? '';

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Push debounced search into URL — skip on mount so pagination isn't reset
  // when the user lands on a page > 1 directly.
  // setSearchParams is intentionally omitted from deps: it changes identity
  // whenever searchParams changes (React Router recreates it), which would
  // cause this effect to re-fire on every page change and reset page to 1.
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) next.set('search', debouncedSearch);
        else next.delete('search');
        next.set('page', '1');
        return next;
      },
      { replace: true },
    );
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
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(n));
        return next;
      },
      { replace: true },
    );
  }

  function setDifficulty(value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set('difficulty', value);
        else next.delete('difficulty');
        next.set('page', '1');
        return next;
      },
      { replace: true },
    );
  }

  function clearFilters() {
    setSearchInput('');
    setSearchParams({ page: '1' }, { replace: true });
  }

  const hasFilters = Boolean(difficulty || searchFromUrl);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              System Design
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {data?.total != null ? `${data.total} questions` : 'Practice system design interviews'}
            </p>
          </div>
          {user?.role === 'ADMIN' && (
            <Link
              to="/system-design/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
              </svg>
              New Question
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-56"
          />

          <Link
            to="/system-design/submissions"
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            My Submissions
          </Link>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <QuestionListSkeleton />
        ) : isError ? (
          <ErrorState />
        ) : questions.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <QuestionTable questions={questions} page={page} pageLimit={PAGE_LIMIT} />
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
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

interface QuestionTableProps {
  questions: SystemDesignQuestionSummary[];
  page: number;
  pageLimit: number;
}

function QuestionTable({ questions, page, pageLimit }: QuestionTableProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">#</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Difficulty</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Date Added</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {questions.map((q, idx) => (
            <tr key={q.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
              <td className="px-4 py-3.5 text-sm text-gray-400 dark:text-gray-500 font-mono">
                {(page - 1) * pageLimit + idx + 1}
              </td>
              <td className="px-4 py-3.5">
                <Link
                  to={`/system-design/${q.id}`}
                  className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                >
                  {q.title}
                </Link>
              </td>
              <td className="px-4 py-3.5">
                <DifficultyBadge difficulty={q.difficulty} />
              </td>
              <td className="px-4 py-3.5 hidden md:table-cell text-sm text-gray-500 dark:text-gray-400">
                {new Date(q.createdAt).toLocaleDateString()}
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
      <p className="text-base font-medium">Failed to load questions</p>
      <p className="text-sm mt-1">Make sure the backend is running</p>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center py-20 text-gray-500 dark:text-gray-400">
      <p className="text-base font-medium">No questions found</p>
      <p className="text-sm mt-1">
        {hasFilters ? 'Try adjusting your filters' : 'No system design questions yet'}
      </p>
    </div>
  );
}
