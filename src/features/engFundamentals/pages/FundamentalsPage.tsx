import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import {
  useTopics,
  useCompleteTopic,
  useUncompleteTopic,
  useScenarios,
  useSubmitAttempt,
  useProjectSessions,
  useGenerateSession,
  useDeleteSession,
  useTemplates,
  useViewTemplate,
  useEngProgress,
} from '../api';
import type { FundamentalTopic, DebugScenario, CommTemplate, Difficulty, AttemptResult } from '../types';

// ── Types ─────────────────────────────────────────────────────────

type MainTab = 'fundamentals' | 'debugging' | 'project-prep' | 'communication';
type DetailTab = 'concepts' | 'qna' | 'quiz';

// ── Markdown renderer ─────────────────────────────────────────────

function Md({ children }: { children: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

// ── Shared primitives ─────────────────────────────────────────────

const DIFF_STYLES: Record<Difficulty, { bg: string; color: string; border: string; label: string }> = {
  EASY:   { bg: 'rgba(16,185,129,0.1)',  color: '#34d399', border: 'rgba(16,185,129,0.25)', label: 'Easy'   },
  MEDIUM: { bg: 'rgba(245,158,11,0.1)',  color: '#fbbf24', border: 'rgba(245,158,11,0.25)', label: 'Medium' },
  HARD:   { bg: 'rgba(239,68,68,0.1)',   color: '#f87171', border: 'rgba(239,68,68,0.25)',  label: 'Hard'   },
};

function DiffBadge({ difficulty }: { difficulty: Difficulty }) {
  const s = DIFF_STYLES[difficulty];
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

// ── Accordion ─────────────────────────────────────────────────────

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-700/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
      >
        <span>{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700/60">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg ${className}`} />;
}

function TopicCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <Skeleton className="w-12 h-12 rounded-xl mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

function ScenarioSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// ── Quiz Block ────────────────────────────────────────────────────

function QuizBlock({
  question, options, correctIndex, explanation,
}: {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4 leading-snug">{question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          let cls =
            'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10';
          if (answered) {
            if (i === correctIndex)
              cls = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300';
            else if (i === selected)
              cls = 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';
            else
              cls = 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/30 text-gray-400 dark:text-gray-600';
          }
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setSelected(i)}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all duration-150 disabled:cursor-default ${cls}`}
            >
              <span className="font-mono text-xs mr-2 opacity-40">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div
          className="mt-4 p-3.5 rounded-lg text-xs leading-relaxed"
          style={{
            background: selected === correctIndex ? 'rgba(16,185,129,0.08)' : 'rgba(99,102,241,0.08)',
            border: `1px solid ${selected === correctIndex ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)'}`,
          }}
        >
          <p
            className="font-bold mb-1"
            style={{ color: selected === correctIndex ? '#34d399' : '#818cf8' }}
          >
            {selected === correctIndex ? '✓ Correct!' : `✗ Incorrect — answer is ${String.fromCharCode(65 + correctIndex)}`}
          </p>
          <Md>{explanation}</Md>
        </div>
      )}
    </div>
  );
}

// ── Topic Detail Panel ────────────────────────────────────────────

function TopicDetail({
  topic,
  isCompleted,
  onClose,
}: {
  topic: FundamentalTopic;
  isCompleted: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>('concepts');
  const complete = useCompleteTopic();
  const uncomplete = useUncompleteTopic();
  const toggling = complete.isPending || uncomplete.isPending;

  function handleToggle() {
    if (isCompleted) {
      uncomplete.mutate(topic.id, {
        onError: () => toast.error('Failed to update progress'),
      });
    } else {
      complete.mutate(topic.id, {
        onSuccess: () => toast.success('Topic marked as complete!'),
        onError: () => toast.error('Failed to update progress'),
      });
    }
  }

  return (
    <div className="mt-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{topic.icon}</span>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{topic.title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{topic.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60 ${
              isCompleted
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            {isCompleted ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
                </svg>
                Completed
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M8.75 3.75a.75.75 0 00-1.5 0v3.5h-3.5a.75.75 0 000 1.5h3.5v3.5a.75.75 0 001.5 0v-3.5h3.5a.75.75 0 000-1.5h-3.5v-3.5z" />
                </svg>
                Mark Complete
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
        {(['concepts', 'qna', 'quiz'] as DetailTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold transition-colors ${
              tab === t
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 bg-white dark:bg-gray-900 -mb-px'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t === 'qna' ? 'Q & A' : t === 'quiz' ? 'Test Yourself' : 'Key Concepts'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {tab === 'concepts' && (
          <div className="space-y-2">
            {topic.concepts
              .sort((a, b) => a.order - b.order)
              .map((c) => (
                <Accordion key={c.id} title={c.title}>
                  <Md>{c.body}</Md>
                </Accordion>
              ))}
          </div>
        )}
        {tab === 'qna' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
              Click a question to reveal the answer. Practice explaining it out loud.
            </p>
            {topic.qna
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <Accordion key={item.id} title={item.question}>
                  <Md>{item.answer}</Md>
                </Accordion>
              ))}
          </div>
        )}
        {tab === 'quiz' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Select an answer to see the explanation.
            </p>
            {topic.quiz
              .sort((a, b) => a.order - b.order)
              .map((q) => (
                <QuizBlock key={q.id} {...q} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab: Fundamentals ─────────────────────────────────────────────

function FundamentalsTab() {
  const { data, isLoading, isError } = useTopics();
  const [selected, setSelected] = useState<FundamentalTopic | null>(null);

  const topics = data?.topics ?? [];
  const completedIds = new Set(data?.completedTopicIds ?? []);

  if (isError) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed to load topics</p>
        <p className="text-xs text-gray-400 mt-1">Make sure the backend is running</p>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Core CS Fundamentals"
        subtitle="Select a topic to explore key concepts, interview Q&A, and mini-quizzes."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <TopicCardSkeleton key={i} />)
          : topics
              .sort((a, b) => a.order - b.order)
              .map((topic) => {
                const isActive = selected?.id === topic.id;
                const isDone = completedIds.has(topic.id);
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelected(isActive ? null : topic)}
                    className="text-left p-5 rounded-2xl border transition-all duration-200 hover:shadow-md group relative"
                    style={{
                      background: isActive ? topic.accentColor : undefined,
                      borderColor: isActive ? topic.borderColor : undefined,
                      boxShadow: isActive ? `0 0 24px ${topic.glowColor}` : undefined,
                    }}
                  >
                    {isDone && (
                      <span
                        className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(16,185,129,0.1)',
                          color: '#34d399',
                          border: '1px solid rgba(16,185,129,0.25)',
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5">
                          <path fillRule="evenodd" d="M9.69 2.53a.75.75 0 01.217.978l-3.75 5.625a.75.75 0 01-1.154.086l-2.25-2.25a.75.75 0 111.06-1.06l1.632 1.63 3.27-4.905a.75.75 0 01.975-.104z" clipRule="evenodd" />
                        </svg>
                        Done
                      </span>
                    )}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-105"
                      style={{ background: topic.accentColor, border: `1px solid ${topic.borderColor}` }}
                    >
                      {topic.icon}
                    </div>
                    <h3 className={`font-bold text-base mb-1 transition-colors ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                      {topic.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{topic.description}</p>
                    <div className="flex items-center gap-3 mt-4 text-xs text-gray-400 dark:text-gray-500">
                      <span>{topic.concepts.length} concepts</span>
                      <span>·</span>
                      <span>{topic.qna.length} Q&amp;A</span>
                      <span>·</span>
                      <span>{topic.quiz.length} quiz</span>
                    </div>
                  </button>
                );
              })}
      </div>
      {selected && (
        <TopicDetail
          topic={selected}
          isCompleted={completedIds.has(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// ── Scenario Card ─────────────────────────────────────────────────

function ScenarioCard({ scenario }: { scenario: DebugScenario }) {
  const [expanded, setExpanded] = useState(false);
  const submitAttempt = useSubmitAttempt();

  // Server pre-populates result if previously attempted
  const [localResult, setLocalResult] = useState<AttemptResult | null>(
    scenario.attempted && scenario.correctIndex !== undefined && scenario.explanation !== undefined
      ? { correct: scenario.correct!, correctIndex: scenario.correctIndex, explanation: scenario.explanation }
      : null,
  );
  const [pendingIdx, setPendingIdx] = useState<number | null>(null);

  const result = localResult;
  const answered = result !== null;

  function handlePick(i: number) {
    if (answered || submitAttempt.isPending) return;
    setPendingIdx(i);
    submitAttempt.mutate(
      { scenarioId: scenario.id, picked: i },
      {
        onSuccess: (data) => {
          setLocalResult(data);
          setPendingIdx(null);
        },
        onError: () => {
          toast.error('Failed to submit answer');
          setPendingIdx(null);
        },
      },
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <DiffBadge difficulty={scenario.difficulty} />
            {answered && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: result.correct ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: result.correct ? '#34d399' : '#f87171',
                  border: `1px solid ${result.correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}
              >
                {result.correct ? '✓ Solved' : '✗ Attempted'}
              </span>
            )}
          </div>
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">{scenario.title}</h3>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 text-gray-400 shrink-0 mt-0.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
          {/* Scenario */}
          <div
            className="p-4 rounded-xl text-sm leading-relaxed"
            style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)' }}
          >
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">Scenario</p>
            <div className="text-gray-700 dark:text-gray-300">
              <Md>{scenario.description}</Md>
            </div>
          </div>

          {/* Hypotheses */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              What is most likely the root cause?
            </p>
            <div className="space-y-2">
              {scenario.hypotheses.map((h, i) => {
                const isCorrect = answered && i === result.correctIndex;
                const isPending = pendingIdx === i && submitAttempt.isPending;

                let cls =
                  'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10';
                if (answered) {
                  if (isCorrect)
                    cls = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300';
                  else
                    cls = 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600';
                }

                return (
                  <button
                    key={i}
                    disabled={answered || submitAttempt.isPending}
                    onClick={() => handlePick(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 disabled:cursor-default ${cls}`}
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        {h}
                      </span>
                    ) : (
                      <>
                        <span className="font-mono text-xs mr-2 opacity-40">{String.fromCharCode(65 + i)}.</span>
                        {h}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation (shown after attempt) */}
          {answered && (
            <div
              className="p-4 rounded-xl text-sm leading-relaxed"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
            >
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">
                Expert Explanation
              </p>
              <div className="text-gray-700 dark:text-gray-300">
                <Md>{result.explanation}</Md>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab: Debugging Lab ────────────────────────────────────────────

type DiffFilter = Difficulty | 'ALL';

function DebuggingTab() {
  const [filter, setFilter] = useState<DiffFilter>('ALL');
  const [page, setPage] = useState(1);

  const params = {
    difficulty: filter === 'ALL' ? ('' as const) : filter,
    page,
    limit: 20,
  };

  const { data, isLoading, isError } = useScenarios(params);
  const scenarios = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const FILTERS: { value: DiffFilter; label: string }[] = [
    { value: 'ALL',    label: 'All'    },
    { value: 'EASY',   label: 'Easy'   },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD',   label: 'Hard'   },
  ];

  return (
    <div>
      <SectionHeader
        title="Debugging Lab"
        subtitle="Real-world production scenarios. Pick the most likely root cause and reveal the expert explanation."
      />

      {/* Filter bar */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
              filter === f.value
                ? 'text-white'
                : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            style={
              filter === f.value
                ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }
                : undefined
            }
          >
            {f.label}
          </button>
        ))}
        {data && (
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
            {data.total} scenario{data.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isError ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-sm text-gray-500">Failed to load scenarios</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <ScenarioSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {scenarios.map((s) => (
              <ScenarioCard key={s.id} scenario={s} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Tab: Project Prep Studio ──────────────────────────────────────

function ProjectPrepTab() {
  const [input, setInput] = useState('');
  const generate = useGenerateSession();
  const { data: sessions = [], isLoading: sessionsLoading } = useProjectSessions();
  const deleteSession = useDeleteSession();

  // Show the most recently generated session result
  const [activeResult, setActiveResult] = useState<(typeof sessions)[0] | null>(null);

  function handleGenerate() {
    const trimmed = input.trim();
    if (trimmed.length < 20) {
      toast.error('Describe your project in at least 20 characters');
      return;
    }
    generate.mutate(trimmed, {
      onSuccess: (session) => {
        setActiveResult(session);
        setInput('');
        toast.success('Questions generated!');
      },
      onError: () => toast.error('Failed to generate questions'),
    });
  }

  const RESULT_SECTIONS: {
    key: keyof NonNullable<typeof activeResult>['questions'];
    label: string;
    icon: string;
    color: string;
  }[] = [
    { key: 'architecture', label: 'Architecture Questions', icon: '🏗️', color: '#6366f1' },
    { key: 'tradeoffs',    label: 'Trade-offs to Discuss',  icon: '⚖️',  color: '#f59e0b' },
    { key: 'scaling',      label: 'Scaling Concerns',       icon: '📈', color: '#10b981' },
  ];

  return (
    <div className="max-w-3xl">
      <SectionHeader
        title="Project Prep Studio"
        subtitle="Describe a project you've built and get a curated set of interview questions."
      />

      {/* Input */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Describe your project
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. I built a real-time collaborative note-taking app using Node.js, WebSockets, and PostgreSQL. It supports offline sync and handles ~10k concurrent users..."
          rows={4}
          className="w-full text-sm text-gray-900 dark:text-white bg-transparent placeholder-gray-400 dark:placeholder-gray-600 outline-none resize-none"
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className={`text-xs transition-colors ${input.length < 20 ? 'text-gray-400' : 'text-emerald-500'}`}>
            {input.length} / 2000 chars {input.length > 0 && input.length < 20 && `(${20 - input.length} more to go)`}
          </span>
          <button
            onClick={handleGenerate}
            disabled={input.trim().length < 20 || generate.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: input.trim().length >= 20 ? '0 2px 12px rgba(99,102,241,0.35)' : 'none',
            }}
          >
            {generate.isPending ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating...
              </>
            ) : (
              'Generate Questions'
            )}
          </button>
        </div>
      </div>

      {/* Current result */}
      {activeResult && (
        <div className="space-y-4 mb-8">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Practice these out loud. Aim for a 2–3 minute structured response to each.
          </p>
          {RESULT_SECTIONS.map(({ key, label, icon, color }) => (
            <div
              key={key}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
            >
              <div
                className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800"
                style={{ background: `${color}08` }}
              >
                <span className="text-base">{icon}</span>
                <h3 className="text-sm font-bold" style={{ color }}>{label}</h3>
                <span
                  className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                >
                  {activeResult.questions[key].length}
                </span>
              </div>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {activeResult.questions[key].map((q, i) => (
                  <li key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                    <span className="text-xs font-mono font-bold mt-0.5 shrink-0 w-5 text-right" style={{ color: `${color}80` }}>
                      {i + 1}.
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {q}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Session history */}
      {(sessionsLoading || sessions.length > 0) && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Past Sessions
          </p>
          {sessionsLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group"
                >
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveResult(s)}>
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {s.description}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      deleteSession.mutate(s.id, {
                        onSuccess: () => {
                          if (activeResult?.id === s.id) setActiveResult(null);
                          toast.success('Session deleted');
                        },
                        onError: () => toast.error('Failed to delete session'),
                      })
                    }
                    className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0 mt-0.5"
                    title="Delete session"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Communication Template Card ───────────────────────────────────

function TemplateCard({ template }: { template: CommTemplate }) {
  const [expanded, setExpanded] = useState(false);
  const viewTemplate = useViewTemplate();

  function handleExpand() {
    const next = !expanded;
    setExpanded(next);
    // Fire-and-forget: mark as viewed when first opened
    if (next && !template.viewedByMe) {
      viewTemplate.mutate(template.id);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <button
        onClick={handleExpand}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          {template.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">{template.title}</h3>
            {template.viewedByMe && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                Reviewed
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{template.description}</p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-5 space-y-5">
          {/* Steps timeline */}
          <div className="relative">
            <div className="absolute left-4 top-5 bottom-5 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-5">
              {template.steps.map((step, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 z-10"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{step.label}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Example */}
          <div
            className="p-4 rounded-xl text-xs leading-relaxed"
            style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}
          >
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">Example in Practice</p>
            <div className="text-gray-600 dark:text-gray-400 italic">
              <Md>{template.example}</Md>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Communication ────────────────────────────────────────────

function CommunicationTab() {
  const { data: templates = [], isLoading, isError } = useTemplates();

  return (
    <div>
      <SectionHeader
        title="Interview Communication"
        subtitle="Frameworks and templates to communicate clearly and confidently in any interview format."
      />
      {isError ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-sm text-gray-500">Failed to load templates</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3 max-w-3xl">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {templates
            .sort((a, b) => a.order - b.order)
            .map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
        </div>
      )}
    </div>
  );
}

// ── Progress Banner ───────────────────────────────────────────────

function ProgressBanner() {
  const { data: progress } = useEngProgress();
  if (!progress) return null;

  const { fundamentals, debugging, communication } = progress;

  const bars: { label: string; done: number; total: number; color: string }[] = [
    { label: 'Topics',     done: fundamentals.completedTopics,  total: fundamentals.totalTopics,      color: '#6366f1' },
    { label: 'Scenarios',  done: debugging.solved,              total: debugging.totalScenarios,      color: '#10b981' },
    { label: 'Templates',  done: communication.viewed,          total: communication.totalTemplates,  color: '#f59e0b' },
  ];

  return (
    <div
      className="mb-6 p-4 rounded-2xl border flex gap-6 flex-wrap"
      style={{ background: 'rgba(99,102,241,0.04)', borderColor: 'rgba(99,102,241,0.12)' }}
    >
      {bars.map(({ label, done, total, color }) => {
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <div key={label} className="flex-1 min-w-30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</span>
              <span className="text-xs font-bold" style={{ color }}>
                {done}/{total}
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}60` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

const TABS: { id: MainTab; label: string; icon: string }[] = [
  { id: 'fundamentals',  label: 'Fundamentals',  icon: '📚' },
  { id: 'debugging',     label: 'Debugging Lab', icon: '🔍' },
  { id: 'project-prep',  label: 'Project Prep',  icon: '🏗️' },
  { id: 'communication', label: 'Communication', icon: '🗣️' },
];

export function FundamentalsPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('fundamentals');

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Engineering Fundamentals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            CS core concepts, debugging scenarios, project prep &amp; communication frameworks.
          </p>
        </div>

        {/* Progress summary */}
        <ProgressBanner />

        {/* Tab bar */}
        <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1 mb-8 w-fit flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                activeTab === tab.id
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              style={
                activeTab === tab.id
                  ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }
                  : undefined
              }
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'fundamentals'  && <FundamentalsTab />}
        {activeTab === 'debugging'     && <DebuggingTab />}
        {activeTab === 'project-prep'  && <ProjectPrepTab />}
        {activeTab === 'communication' && <CommunicationTab />}
      </div>
    </div>
  );
}
