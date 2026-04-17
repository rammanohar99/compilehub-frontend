import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProblems } from '../api/problems';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Difficulty, Problem } from '../types';

const DIFFICULTIES: { value: string; label: string }[] = [
  { value: '', label: 'All Difficulties' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

const PAGE_LIMIT = 10;

export function ProblemsPage() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [company, setCompany] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);

  // Debounce text filter inputs so we don't fire a query on every keystroke
  // Capitalize first letter of each word to match DB casing (e.g. "google" → "Google")
  function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setCompany(companyInput.trim() ? toTitleCase(companyInput.trim()) : '');
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [companyInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTag(tagInput.trim() ? toTitleCase(tagInput.trim()) : '');
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [tagInput]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['problems', { difficulty, company, tag, page }],
    queryFn: () =>
      getProblems({ difficulty: difficulty || undefined, company: company || undefined, tag: tag || undefined, page, limit: PAGE_LIMIT }),
    placeholderData: (prev) => prev,
  });

  const problems = data?.problems ?? [];
  const totalPages = data?.totalPages ?? 1;
  // Use values from the response so row numbers always match the displayed data,
  // even while placeholderData is showing stale results during a page transition.
  const dataPage = data?.page ?? page;
  const dataLimit = data?.limit ?? PAGE_LIMIT;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Problems</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {data?.total != null ? `${data.total} problems` : 'Practice coding problems'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>

          <input
            type="text"
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            placeholder="e.g. Google, Amazon..."
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-44"
          />

          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="e.g. array, graph..."
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-44"
          />

          {(difficulty || companyInput || tagInput) && (
            <button
              onClick={() => { setDifficulty(''); setCompanyInput(''); setTagInput(''); setCompany(''); setTag(''); setPage(1); }}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              <p className="text-base font-medium">Failed to load problems</p>
              <p className="text-sm mt-1">Make sure the backend is running at localhost:5000</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              <p className="text-base font-medium">No problems found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Difficulty</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Tags</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Companies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {problems.map((problem: Problem, idx: number) => (
                  <tr
                    key={problem.id}
                    onClick={() => navigate(`/problems/${problem.id}`)}
                    className="cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group"
                  >
                    <td className="px-4 py-3.5 text-sm text-gray-400 dark:text-gray-500 font-mono">
                      {(dataPage - 1) * dataLimit + idx + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {problem.title}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <DifficultyBadge difficulty={problem.difficulty as Difficulty} />
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {problem.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span className="text-xs text-gray-400">+{problem.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {problem.companies.slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          >
                            {c}
                          </span>
                        ))}
                        {problem.companies.length > 2 && (
                          <span className="text-xs text-gray-400">+{problem.companies.length - 2}</span>
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
        {data && totalPages >= 1 && (
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
