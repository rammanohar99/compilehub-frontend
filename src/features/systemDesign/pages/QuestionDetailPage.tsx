import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';
import { DifficultyBadge } from '../../../components/DifficultyBadge';
import { useQuestion } from '../hooks/useQuestion';
import {
  submitAnswer,
  getApiError,
  getComments,
  postComment,
  toggleCommentLike,
  deleteComment,
  getCanvasState,
  saveCanvasState,
  getMyQuestionSubmissions,
} from '../api/systemDesign';
import type { SDComment } from '../api/systemDesign';
import { HintAccordion } from '../components/HintAccordion';
import { DetailSkeleton } from '../components/QuestionListSkeleton';
import { DesignCanvas } from '../components/DesignCanvas';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import type { SystemDesignQuestion } from '../types';
import type { Node, Edge } from '@xyflow/react';

const MIN_ANSWER_LENGTH = 10;

type LeftTab = 'description' | 'solutions' | 'discussion' | 'ai-hint';
type RightTab = 'text' | 'canvas' | 'history';

// ── Main Page ─────────────────────────────────────────────────────

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
      const result = await submitAnswer(id!, answer.trim());
      toast.success('Answer submitted!');
      navigate(`/system-design/submissions/${result.id}`);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <DetailSkeleton />;

  if (isError || !question) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-400">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-base font-semibold text-white">Failed to load question</p>
          <Link to="/system-design" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            ← Back to questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-gray-950">
      <LeftPanel question={question} isAdmin={user?.role === 'ADMIN'} />
      <div className="w-px bg-gray-800 shrink-0" />
      <RightPanel
        answer={answer}
        onChange={setAnswer}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        questionId={question.id}
      />
    </div>
  );
}

// ── Left Panel ────────────────────────────────────────────────────

interface LeftPanelProps { question: SystemDesignQuestion; isAdmin: boolean }

const LEFT_TABS: { id: LeftTab; label: string }[] = [
  { id: 'description', label: 'Description' },
  { id: 'solutions',   label: 'Solutions' },
  { id: 'discussion',  label: 'Discussion' },
  { id: 'ai-hint',     label: 'AI Hint' },
];

function LeftPanel({ question, isAdmin }: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<LeftTab>('description');

  return (
    <div className="w-1/2 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 shrink-0">
        <Link
          to="/system-design"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 010 1.06L7.06 8l2.72 2.72a.75.75 0 11-1.06 1.06L5.47 8.53a.75.75 0 010-1.06l3.25-3.25a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
          All Questions
        </Link>
        <div className="flex items-center gap-3">
          <DifficultyBadge difficulty={question.difficulty} />
          {isAdmin && (
            <Link
              to={`/system-design/${question.id}/edit`}
              className="text-xs font-medium text-gray-500 hover:text-indigo-400 transition-colors"
            >
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="px-5 pt-4 pb-0 shrink-0">
        <h1 className="text-lg font-bold text-white leading-snug">{question.title}</h1>
      </div>

      <div className="flex px-5 mt-3 border-b border-gray-800 shrink-0 gap-0">
        {LEFT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'description' && <DescriptionTab question={question} />}
        {activeTab === 'solutions'   && <SolutionsTab question={question} />}
        {activeTab === 'discussion'  && <DiscussionTab questionId={question.id} />}
        {activeTab === 'ai-hint'     && <AIHintTab hints={question.hints} />}
      </div>
    </div>
  );
}

// ── Left Tab: Description ─────────────────────────────────────────

function DescriptionTab({ question }: { question: SystemDesignQuestion }) {
  return (
    <div className="p-5 space-y-6">
      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{question.description}</p>

      {question.requirements.length > 0 && (
        <div>
          <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-3">Requirements</h2>
          <ol className="space-y-2">
            {question.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                {req}
              </li>
            ))}
          </ol>
        </div>
      )}

      {question.constraints.length > 0 && (
        <div>
          <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-3">Constraints</h2>
          <ul className="space-y-2">
            {question.constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="shrink-0 w-1 h-1 rounded-full bg-gray-600 mt-2" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      <HintAccordion hints={question.hints} />
    </div>
  );
}

// ── Left Tab: Solutions ───────────────────────────────────────────

function SolutionsTab({ question }: { question: SystemDesignQuestion }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-5 space-y-4">
      {!open ? (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-yellow-400">Try it first!</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Attempting the problem before viewing the solution will help you learn more effectively.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="mt-3 w-full px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs font-semibold text-yellow-400 hover:bg-yellow-500/20 transition-colors"
          >
            Show Solution Anyway
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-2.5">Overview</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{question.solution.overview}</p>
          </div>

          {question.solution.steps.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-3">Implementation Steps</h3>
              <ol className="space-y-4">
                {question.solution.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold mt-0.5 border border-indigo-500/30">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{(s as unknown as { step: string }).step}</p>
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">{(s as unknown as { detail: string }).detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {question.solution.tradeoffs.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-3">Tradeoffs</h3>
              <div className="space-y-2.5">
                {question.solution.tradeoffs.map((t, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-gray-900 border border-gray-800">
                    <p className="text-sm font-semibold text-white">{(t as unknown as { aspect: string }).aspect}</p>
                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">{(t as unknown as { tradeoff: string }).tradeoff}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Left Tab: Discussion ──────────────────────────────────────────

function DiscussionTab({ questionId }: { questionId: string }) {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['sd-comments', questionId],
    queryFn: () => getComments(questionId),
    staleTime: 30_000,
  });

  const postMutation = useMutation({
    mutationFn: (text: string) => postComment(questionId, text),
    onSuccess: (newComment) => {
      qc.setQueryData(['sd-comments', questionId], (old: typeof data) => {
        if (!old) return old;
        return { ...old, comments: [newComment, ...old.comments], total: old.total + 1 };
      });
      setCommentText('');
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const likeMutation = useMutation({
    mutationFn: (commentId: string) => toggleCommentLike(commentId),
    onSuccess: (result, commentId) => {
      qc.setQueryData(['sd-comments', questionId], (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.map((c: SDComment) =>
            c.id === commentId ? { ...c, likes: result.likes, likedByMe: result.liked } : c,
          ),
        };
      });
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: (_, commentId) => {
      qc.setQueryData(['sd-comments', questionId], (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.filter((c: SDComment) => c.id !== commentId),
          total: Math.max(0, old.total - 1),
        };
      });
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const comments = data?.comments ?? [];

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-gray-500">{data?.total ?? 0} comments</p>
        <span className="text-[10px] text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 rounded-full">Community</span>
      </div>

      {/* New comment input */}
      <div className="space-y-2">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Share your approach..."
          rows={3}
          className="w-full resize-none p-3 text-sm text-gray-200 bg-gray-900 border border-gray-800 rounded-xl outline-none focus:border-indigo-500/50 placeholder-gray-600 leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <span className={`text-xs ${commentText.length < 5 ? 'text-gray-600' : 'text-gray-400'}`}>
            {commentText.length} / 1000
          </span>
          <button
            onClick={() => postMutation.mutate(commentText)}
            disabled={postMutation.isPending || commentText.trim().length < 5}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {postMutation.isPending ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      {/* Comment list */}
      {isLoading ? (
        <div className="flex justify-center py-6"><LoadingSpinner size="md" /></div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-6">No comments yet — be the first!</p>
      ) : (
        comments.map((item: SDComment) => (
          <div key={item.id} className="p-4 rounded-xl bg-gray-900 border border-gray-800">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: '#6366f1' }}
              >
                {item.user.avatarInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-200">{item.user.name}</p>
                <p className="text-[10px] text-gray-500">{item.timeAgo}</p>
              </div>
              {(user?.id === item.user.id || user?.role === 'ADMIN') && (
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-[10px]"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{item.text}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <button
                onClick={() => likeMutation.mutate(item.id)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  item.likedByMe ? 'text-indigo-400' : 'text-gray-500 hover:text-indigo-400'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M2 6.342a3.375 3.375 0 016-2.088 3.375 3.375 0 016 2.088c0 4.268-4.857 7.841-6 8.558C6.857 14.183 2 10.61 2 6.342z" />
                </svg>
                {item.likes}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Left Tab: AI Hint ─────────────────────────────────────────────

function AIHintTab({ hints }: { hints: string[] }) {
  const [revealed, setRevealed] = useState(0);
  const [loading, setLoading] = useState(false);

  const revealNext = () => {
    if (revealed >= hints.length) return;
    setLoading(true);
    setTimeout(() => { setRevealed((n) => n + 1); setLoading(false); }, 800);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-indigo-500/8 border border-indigo-500/20">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-indigo-400">
            <path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.572.729 6.016 6.016 0 002.856 0A.75.75 0 0012 15.1v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-300">AI-Powered Hints</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Progressive hints to guide your thinking</p>
        </div>
      </div>

      {revealed === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">Click below to reveal your first hint</p>
      )}

      <div className="space-y-3">
        {hints.slice(0, revealed).map((hint, i) => (
          <div key={i} className="p-4 rounded-xl bg-gray-900 border border-gray-800">
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              Hint {i + 1}
            </span>
            <p className="text-sm text-gray-300 leading-relaxed mt-2">{hint}</p>
          </div>
        ))}
      </div>

      {revealed < hints.length ? (
        <button
          onClick={revealNext}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-all disabled:opacity-50"
        >
          {loading ? 'Thinking...' : revealed === 0 ? 'Get First Hint' : `Reveal Hint ${revealed + 1} of ${hints.length}`}
        </button>
      ) : (
        <p className="text-xs text-gray-500 text-center py-2">All {hints.length} hints revealed</p>
      )}
    </div>
  );
}

// ── Right Panel ───────────────────────────────────────────────────

interface RightPanelProps {
  answer: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  questionId: string;
}

const RIGHT_TABS: { id: RightTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'text',
    label: 'Text Answer',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2 1.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h4a.5.5 0 010 1h-4a.5.5 0 01-.5-.5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'canvas',
    label: 'Canvas',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M13.488 2.513a1.75 1.75 0 00-2.475 0L6.75 6.774a2.75 2.75 0 00-.596.892l-.848 2.047a.75.75 0 00.98.98l2.047-.848a2.75 2.75 0 00.892-.596l4.261-4.263a1.75 1.75 0 000-2.474z" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M1 8a7 7 0 1114 0A7 7 0 011 8zm7.75-4.25a.75.75 0 00-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 000-1.5h-2.5v-3.5z" clipRule="evenodd" />
      </svg>
    ),
  },
];

function RightPanel({ answer, onChange, onSubmit, isSubmitting, questionId }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<RightTab>('text');
  const charCount = answer.length;
  const isValid = answer.trim().length >= MIN_ANSWER_LENGTH;

  return (
    <div className="w-1/2 flex flex-col bg-gray-950 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-800 px-4 shrink-0">
        <div className="flex gap-0">
          {RIGHT_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === 'text' && (
          <span className={`text-xs font-mono ${charCount < MIN_ANSWER_LENGTH ? 'text-gray-600' : 'text-emerald-400'}`}>
            {charCount} chars
          </span>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'text' && (
          <>
            <textarea
              value={answer}
              onChange={(e) => onChange(e.target.value)}
              placeholder={[
                'Write your system design here...',
                '',
                'Cover:',
                '• High-level architecture',
                '• Key components and their responsibilities',
                '• Data flow and API design',
                '• Database choices and schema',
                '• Scalability and reliability strategies',
                '• Estimated capacity and bottlenecks',
              ].join('\n')}
              className="flex-1 resize-none p-5 text-sm text-gray-200 bg-transparent outline-none placeholder-gray-700 leading-relaxed font-mono"
            />
            <div className="px-5 py-3.5 border-t border-gray-800 shrink-0 flex items-center justify-between gap-4">
              {!isValid && charCount > 0 && (
                <p className="text-xs text-gray-600">
                  {MIN_ANSWER_LENGTH - answer.trim().length} more chars needed
                </p>
              )}
              <div className="ml-auto">
                <button
                  onClick={onSubmit}
                  disabled={isSubmitting || !isValid}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: isValid ? '#6366f1' : '#374151' }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                        <path d="M2.87 2.298a.75.75 0 00-.812 1.022l1.526 3.5H8.75a.75.75 0 010 1.5H3.584l-1.526 3.5a.75.75 0 00.812 1.022l10.5-4.5a.75.75 0 000-1.044l-10.5-4.5z" />
                      </svg>
                      Submit Answer
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'canvas' && (
          <div className="flex-1 overflow-hidden flex">
            <CanvasTab questionId={questionId} />
          </div>
        )}

        {activeTab === 'history' && <HistoryTab questionId={questionId} />}
      </div>
    </div>
  );
}

// ── Canvas Tab ────────────────────────────────────────────────────

function CanvasTab({ questionId }: { questionId: string }) {
  const { data: saved, isLoading } = useQuery({
    queryKey: ['sd-canvas', questionId],
    queryFn: () => getCanvasState(questionId),
    staleTime: Infinity,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  const handleCanvasChange = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      // Skip the first fire from component mount
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveCanvasState(questionId, nodes as object[], edges as object[]).catch(() => {
          // silent fail — user can still work
        });
      }, 2000);
    },
    [questionId],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <DesignCanvas
      initialNodes={saved?.nodes as Node[] | undefined}
      initialEdges={saved?.edges as Edge[] | undefined}
      onCanvasChange={handleCanvasChange}
    />
  );
}

// ── History Tab ───────────────────────────────────────────────────

function HistoryTab({ questionId }: { questionId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['sd-question-submissions', questionId],
    queryFn: () => getMyQuestionSubmissions(questionId),
    staleTime: 30_000,
  });

  const submissions = data?.submissions ?? [];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-gray-700 mx-auto">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-500">No previous submissions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-3">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4">
        Previous Submissions ({data?.total ?? 0})
      </p>
      {submissions.map((item) => (
        <div
          key={item.id}
          className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-gray-300">
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </p>
              <p className="text-[10px] text-gray-600">{item.timeAgo}</p>
            </div>
            <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
              {item.wordCount} words
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.answerText}</p>
        </div>
      ))}
    </div>
  );
}
