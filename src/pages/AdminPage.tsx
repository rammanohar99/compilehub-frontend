import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getProblems, createProblem, addTestCases } from '../api/problems';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Difficulty, Problem } from '../types';

type Step = 'list' | 'create-problem' | 'add-testcases';

interface TestCaseInput {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

const EMPTY_PROBLEM = {
  title: '',
  description: '',
  difficulty: 'EASY',
  companies: '',
  tags: '',
};

const EMPTY_TC: TestCaseInput = { input: '', expectedOutput: '', isHidden: false };

export function AdminPage() {
  const [step, setStep] = useState<Step>('list');
  const [createdProblemId, setCreatedProblemId] = useState<string | null>(null);
  const [createdProblemTitle, setCreatedProblemTitle] = useState('');
  const qc = useQueryClient();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage problems and test cases</p>
          </div>
          {step !== 'list' && (
            <button
              onClick={() => { setStep('list'); setCreatedProblemId(null); }}
              className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Back to problems
            </button>
          )}
        </div>

        {step === 'list' && (
          <ProblemList
            onCreateNew={() => setStep('create-problem')}
          />
        )}

        {step === 'create-problem' && (
          <CreateProblemForm
            onSuccess={(id, title) => {
              setCreatedProblemId(id);
              setCreatedProblemTitle(title);
              setStep('add-testcases');
              qc.invalidateQueries({ queryKey: ['problems'] });
            }}
          />
        )}

        {step === 'add-testcases' && createdProblemId && (
          <AddTestCasesForm
            problemId={createdProblemId}
            problemTitle={createdProblemTitle}
            onDone={() => {
              setStep('list');
              setCreatedProblemId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ── Problem List ──────────────────────────────────────────── */
function ProblemList({ onCreateNew }: { onCreateNew: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-problems'],
    queryFn: () => getProblems({ limit: 100 }),
  });

  const problems = data?.problems ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          New Problem
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : problems.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="font-medium">No problems yet</p>
            <p className="text-sm mt-1">Create your first problem to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Difficulty</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Tags</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Companies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {problems.map((p: Problem) => (
                <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-white">{p.title}</td>
                  <td className="px-4 py-3.5">
                    <DifficultyBadge difficulty={p.difficulty as Difficulty} />
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.slice(0, 3).map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.companies.slice(0, 2).map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">{c}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Create Problem Form ───────────────────────────────────── */
function CreateProblemForm({ onSuccess }: { onSuccess: (id: string, title: string) => void }) {
  const [form, setForm] = useState(EMPTY_PROBLEM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_PROBLEM>>({});
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof EMPTY_PROBLEM) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((errs) => ({ ...errs, [field]: '' }));
    };
  }

  function validate() {
    const e: Partial<typeof EMPTY_PROBLEM> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const problem = await createProblem({
        title: form.title.trim(),
        description: form.description.trim(),
        difficulty: form.difficulty,
        companies: splitCsv(form.companies),
        tags: splitCsv(form.tags),
      });
      toast.success('Problem created! Now add test cases.');
      onSuccess(problem.id, problem.title);
    } catch {
      toast.error('Failed to create problem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Create New Problem</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Title" error={errors.title}>
          <input
            type="text"
            value={form.title}
            onChange={set('title')}
            placeholder="Two Sum"
            className={inputCls(!!errors.title)}
          />
        </FormField>

        <FormField label="Difficulty">
          <select value={form.difficulty} onChange={set('difficulty')} className={inputCls(false)}>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </FormField>

        <FormField
          label="Description"
          hint="Markdown supported"
          error={errors.description}
        >
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={8}
            placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
            className={`${inputCls(!!errors.description)} resize-y font-mono text-xs`}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Tags" hint="Comma separated">
            <input
              type="text"
              value={form.tags}
              onChange={set('tags')}
              placeholder="Array, Hash Table"
              className={inputCls(false)}
            />
          </FormField>
          <FormField label="Companies" hint="Comma separated">
            <input
              type="text"
              value={form.companies}
              onChange={set('companies')}
              placeholder="Google, Amazon"
              className={inputCls(false)}
            />
          </FormField>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading && <LoadingSpinner size="sm" className="text-white" />}
            {loading ? 'Creating...' : 'Create Problem'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Add Test Cases Form ───────────────────────────────────── */
function AddTestCasesForm({
  problemId,
  problemTitle,
  onDone,
}: {
  problemId: string;
  problemTitle: string;
  onDone: () => void;
}) {
  const [testCases, setTestCases] = useState<TestCaseInput[]>([{ ...EMPTY_TC }]);
  const [loading, setLoading] = useState(false);

  function addRow() {
    setTestCases((tcs) => [...tcs, { ...EMPTY_TC }]);
  }

  function removeRow(i: number) {
    setTestCases((tcs) => tcs.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, field: keyof TestCaseInput, value: string | boolean) {
    setTestCases((tcs) =>
      tcs.map((tc, idx) => (idx === i ? { ...tc, [field]: value } : tc))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = testCases.filter((tc) => tc.input.trim() && tc.expectedOutput.trim());
    if (valid.length === 0) {
      toast.error('Add at least one test case with input and expected output.');
      return;
    }
    setLoading(true);
    try {
      await addTestCases(problemId, {
        testCases: valid.map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
        })),
      });
      toast.success(`${valid.length} test case(s) added!`);
      onDone();
    } catch {
      toast.error('Failed to add test cases.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Test Cases</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Problem: <span className="font-medium text-gray-700 dark:text-gray-300">{problemTitle}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {testCases.map((tc, i) => (
          <div
            key={i}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3 relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Test Case {i + 1}
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tc.isHidden}
                    onChange={(e) => updateRow(i, 'isHidden', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  Hidden
                </label>
                {testCases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Input
                </label>
                <textarea
                  value={tc.input}
                  onChange={(e) => updateRow(i, 'input', e.target.value)}
                  rows={3}
                  placeholder="[2,7,11,15]&#10;9"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Expected Output
                </label>
                <textarea
                  value={tc.expectedOutput}
                  onChange={(e) => updateRow(i, 'expectedOutput', e.target.value)}
                  rows={3}
                  placeholder="[0,1]"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add test case
        </button>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onDone}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Skip for now
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading && <LoadingSpinner size="sm" className="text-white" />}
            {loading ? 'Saving...' : 'Save Test Cases'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────────────── */
function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
    hasError ? 'border-red-400 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
  }`;
}

function splitCsv(s: string): string[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}
