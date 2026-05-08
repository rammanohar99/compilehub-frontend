import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProblems } from '../api/problems';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { useTheme } from '../hooks/useTheme';
import type { Difficulty, Problem } from '../types';

const DIFFICULTIES = [
  { value: '', label: 'All Difficulties' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

const PAGE_LIMIT = 10;

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export function ProblemsPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const difficulty = searchParams.get('difficulty') ?? '';
  const companyFromUrl = searchParams.get('company') ?? '';
  const tagFromUrl = searchParams.get('tag') ?? '';

  const [companyInput, setCompanyInput] = useState(companyFromUrl);
  const [tagInput, setTagInput] = useState(tagFromUrl);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const val = companyInput.trim() ? toTitleCase(companyInput.trim()) : '';
        if (val) next.set('company', val); else next.delete('company');
        next.delete('page');
        return next;
      }, { replace: true });
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyInput]);

  useEffect(() => {
    if (!isMounted.current) return;
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const val = tagInput.trim() ? toTitleCase(tagInput.trim()) : '';
        if (val) next.set('tag', val); else next.delete('tag');
        next.delete('page');
        return next;
      }, { replace: true });
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagInput]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['problems', { difficulty, company: companyFromUrl, tag: tagFromUrl, page }],
    queryFn: () => getProblems({
      difficulty: difficulty || undefined,
      company: companyFromUrl || undefined,
      tag: tagFromUrl || undefined,
      page,
      limit: PAGE_LIMIT,
    }),
    placeholderData: (prev) => prev,
  });

  const problems = data?.problems ?? [];
  const totalPages = data?.totalPages ?? 1;
  const dataPage = data?.page ?? page;
  const dataLimit = data?.limit ?? PAGE_LIMIT;

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
    setCompanyInput('');
    setTagInput('');
    setSearchParams({}, { replace: true });
  }

  const hasFilters = Boolean(difficulty || companyFromUrl || tagFromUrl);

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: isDark ? '#060612' : '#f1f5f9' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Problems</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {data?.total != null ? `${data.total} problems` : 'Practice coding problems'}
            </p>
          </div>
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
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            placeholder="Company (e.g. Google)"
            className={`px-3 py-2 text-sm rounded-xl border outline-none transition-colors w-full sm:w-44 ${
              isDark
                ? 'bg-gray-800/60 border-gray-700/50 text-gray-200 placeholder-gray-600 focus:border-indigo-500/50'
                : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-indigo-400'
            }`}
          />

          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Tag (e.g. Array)"
            className={`px-3 py-2 text-sm rounded-xl border outline-none transition-colors w-full sm:w-44 ${
              isDark
                ? 'bg-gray-800/60 border-gray-700/50 text-gray-200 placeholder-gray-600 focus:border-indigo-500/50'
                : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-indigo-400'
            }`}
          />

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
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
          }}
        >
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <EmptyState message="Failed to load problems" sub="Make sure the backend is running" />
          ) : problems.length === 0 ? (
            <EmptyState message="No problems found" sub={hasFilters ? 'Try adjusting your filters' : 'No problems yet'} />
          ) : (
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
                  <th className="text-left px-5 py-3.5 hidden md:table-cell">Tags</th>
                  <th className="text-left px-5 py-3.5 hidden lg:table-cell">Companies</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem: Problem, idx: number) => (
                  <tr
                    key={problem.id}
                    onClick={() => navigate(`/problems/${problem.id}`)}
                    className="cursor-pointer group transition-colors border-b last:border-0"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
                    }}
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
                      {(dataPage - 1) * dataLimit + idx + 1}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                        {problem.title}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <DifficultyBadge difficulty={problem.difficulty as Difficulty} />
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {problem.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{
                              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                              color: isDark ? '#9ca3af' : '#6b7280',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            +{problem.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {problem.companies.slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{
                              background: 'rgba(99,102,241,0.1)',
                              color: '#818cf8',
                              border: '1px solid rgba(99,102,241,0.15)',
                            }}
                          >
                            {c}
                          </span>
                        ))}
                        {problem.companies.length > 2 && (
                          <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            +{problem.companies.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

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

function TableSkeleton() {
  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center animate-pulse">
          <div className="w-6 h-3 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1 h-3 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="w-16 h-5 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="w-24 h-3 rounded bg-gray-200 dark:bg-gray-800 hidden md:block" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div className="py-20 text-center">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{message}</p>
      <p className="text-xs mt-1 text-gray-400 dark:text-gray-600">{sub}</p>
    </div>
  );
}
