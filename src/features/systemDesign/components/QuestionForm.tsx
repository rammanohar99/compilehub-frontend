import { useState } from 'react';
import { DynamicListInput } from './DynamicListInput';
import type { QuestionFormValues, Difficulty } from '../types';
import { defaultFormValues } from '../types';

const DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];

interface QuestionFormProps {
  initialValues?: QuestionFormValues;
  onSubmit: (values: QuestionFormValues) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
}

function validate(v: QuestionFormValues): string | null {
  if (v.title.trim().length < 3) return 'Title must be at least 3 characters';
  if (!v.difficulty) return 'Difficulty is required';
  if (v.description.trim().length < 10) return 'Description must be at least 10 characters';
  if (!v.requirements.some((r) => r.trim())) return 'At least one requirement is required';
  if (!v.constraints.some((c) => c.trim())) return 'At least one constraint is required';
  if (v.solution.overview.trim().length < 10)
    return 'Solution overview must be at least 10 characters';
  return null;
}

export function QuestionForm({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: QuestionFormProps) {
  const [values, setValues] = useState<QuestionFormValues>(
    initialValues ?? defaultFormValues,
  );
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof QuestionFormValues>(
    key: K,
    value: QuestionFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setSolution<K extends keyof QuestionFormValues['solution']>(
    key: K,
    value: QuestionFormValues['solution'][K],
  ) {
    setValues((prev) => ({
      ...prev,
      solution: { ...prev.solution, [key]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(values);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    await onSubmit(values);
  }

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';

  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className={labelClass}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={values.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Design a URL shortener"
          className={inputClass}
        />
      </div>

      {/* Difficulty */}
      <div>
        <label className={labelClass}>
          Difficulty <span className="text-red-500">*</span>
        </label>
        <select
          value={values.difficulty}
          onChange={(e) => set('difficulty', e.target.value as Difficulty | '')}
          className={inputClass}
        >
          <option value="">Select difficulty</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          rows={4}
          placeholder="Describe the system design problem..."
          className={inputClass}
        />
      </div>

      {/* Requirements */}
      <DynamicListInput
        label="Requirements"
        items={values.requirements}
        onChange={(items) => set('requirements', items)}
        placeholder="Requirement"
        required
      />

      {/* Constraints */}
      <DynamicListInput
        label="Constraints"
        items={values.constraints}
        onChange={(items) => set('constraints', items)}
        placeholder="Constraint"
        required
      />

      {/* Hints */}
      <DynamicListInput
        label="Hints"
        items={values.hints}
        onChange={(items) => set('hints', items)}
        placeholder="Hint"
      />

      {/* Solution */}
      <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Solution
        </h3>

        <div>
          <label className={labelClass}>
            Overview <span className="text-red-500">*</span>
          </label>
          <textarea
            value={values.solution.overview}
            onChange={(e) => setSolution('overview', e.target.value)}
            rows={3}
            placeholder="High-level overview of the solution..."
            className={inputClass}
          />
        </div>

        <DynamicListInput
          label="Steps"
          items={values.solution.steps}
          onChange={(items) => setSolution('steps', items)}
          placeholder="Step"
        />

        <DynamicListInput
          label="Tradeoffs"
          items={values.solution.tradeoffs}
          onChange={(items) => setSolution('tradeoffs', items)}
          placeholder="Tradeoff"
        />

        <div>
          <label className={labelClass}>Diagram (JSON — optional)</label>
          <textarea
            rows={3}
            disabled
            placeholder="Diagram builder coming soon..."
            className={`${inputClass} opacity-50 cursor-not-allowed resize-none`}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white text-sm font-semibold transition-colors disabled:cursor-not-allowed"
      >
        {submitLabel}
      </button>
    </form>
  );
}
