import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';
import { DifficultyBadge } from '../../../components/DifficultyBadge';
import { useQuestion } from '../hooks/useQuestion';
import { submitAnswer, getApiError } from '../api/systemDesign';
import { HintAccordion } from '../components/HintAccordion';
import { DetailSkeleton } from '../components/QuestionListSkeleton';
import type { SystemDesignQuestion } from '../types';

const MIN_ANSWER_LENGTH = 10;

export function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: question, isLoading, isError } = useQuestion(id!);

  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (answer.trim().length < MIN_ANSWER_LENGTH) {
      toast.error(`Answer must be at least ${MIN_ANSWER_LENGTH} characters`);
      return;
    }
    setIsSubmitting(true);
    try {
      const submission = await submitAnswer(id!, answer.trim());
      toast.success('Answer submitted!');
      navigate(`/system-design/submissions/${submission.id}`);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <DetailSkeleton />;

  if (isError || !question) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-base font-medium">Failed to load question</p>
          <Link to="/system-design" className="text-sm text-blue-600 dark:text-blue-400 mt-2 inline-block">
            ← Back to questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <LeftPanel question={question} isAdmin={user?.role === 'ADMIN'} />
      <RightPanel
        answer={answer}
        onChange={setAnswer}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

// ── Left panel ────────────────────────────────────────────────────

interface LeftPanelProps {
  question: SystemDesignQuestion;
  isAdmin: boolean;
}

function LeftPanel({ question, isAdmin }: LeftPanelProps) {
  const [solutionOpen, setSolutionOpen] = useState(false);

  return (
    <div className="w-1/2 flex flex-col overflow-hidden border-r border-gray-200 dark:border-gray-700">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <Link
            to="/system-design"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            ← All Questions
          </Link>
          {isAdmin && (
            <Link
              to={`/system-design/${question.id}/edit`}
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Edit
            </Link>
          )}
        </div>

        {/* Title + badge */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{question.title}</h1>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>

        {/* Description */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            Description
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {question.description}
          </p>
        </div>

        {/* Requirements */}
        {question.requirements.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Requirements
            </h2>
            <ol className="list-decimal list-inside space-y-1.5">
              {question.requirements.map((req, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300">{req}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Constraints */}
        {question.constraints.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Constraints
            </h2>
            <ul className="list-disc list-inside space-y-1.5">
              {question.constraints.map((c, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300">{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Hints */}
        <HintAccordion hints={question.hints} />

        {/* Solution */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setSolutionOpen((o) => !o)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-4 h-4 transition-transform ${solutionOpen ? 'rotate-90' : ''}`}
            >
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
            {solutionOpen ? 'Hide' : 'Show'} Solution
          </button>

          {solutionOpen && (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Overview
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {question.solution.overview}
                </p>
              </div>

              {question.solution.steps.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Steps
                  </h3>
                  <ol className="space-y-3">
                    {question.solution.steps.map((s, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.step}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{s.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {question.solution.tradeoffs.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Tradeoffs
                  </h3>
                  <ul className="space-y-3">
                    {question.solution.tradeoffs.map((t, i) => (
                      <li key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t.aspect}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{t.tradeoff}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Diagram placeholder */}
              <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
                  <path d="M3 9h18M9 21V9" strokeWidth="1.5" />
                </svg>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Diagram Builder coming soon
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Right panel ───────────────────────────────────────────────────

interface RightPanelProps {
  answer: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function RightPanel({ answer, onChange, onSubmit, isSubmitting }: RightPanelProps) {
  const charCount = answer.length;
  const isValid = answer.trim().length >= MIN_ANSWER_LENGTH;

  return (
    <div className="w-1/2 flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Your Design Answer
        </h2>
        <span className={`text-xs font-mono ${charCount < MIN_ANSWER_LENGTH ? 'text-gray-400 dark:text-gray-500' : 'text-green-600 dark:text-green-400'}`}>
          {charCount} chars
        </span>
      </div>

      {/* Textarea */}
      <textarea
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your system design answer here...&#10;&#10;Consider covering:&#10;• High-level architecture&#10;• Key components and their responsibilities&#10;• Data flow between components&#10;• Scalability and reliability considerations&#10;• Database choices and schema&#10;• API design"
        className="flex-1 resize-none p-5 text-sm text-gray-800 dark:text-gray-200 bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-600 leading-relaxed font-mono"
      />

      {/* Submit bar */}
      <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0 flex items-center justify-between gap-4">
        {!isValid && charCount > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {MIN_ANSWER_LENGTH - answer.trim().length} more characters needed
          </p>
        )}
        <div className="ml-auto">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white text-sm font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {isSubmitting && (
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      </div>
    </div>
  );
}
