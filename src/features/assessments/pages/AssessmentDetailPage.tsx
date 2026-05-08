import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assessmentApi } from '../api/assessments';
import { useAssessmentStore } from '../store/assessmentStore';
import { useTheme } from '../../../hooks/useTheme';
import { AssessmentPageShell } from '../components/AssessmentLayout';
import { TopicSkeleton } from '../components/Skeletons';
import type { CreateAssessmentRequest } from '../types';
import toast from 'react-hot-toast';

const setupSchema = z.object({
  topicId: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  questionCount: z.number().min(5).max(30),
  isPractice: z.boolean(),
});

type SetupForm = z.infer<typeof setupSchema>;

const DIFFICULTY_CONFIG = {
  EASY:   { label: 'Easy',   color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)'  },
  MEDIUM: { label: 'Medium', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  },
  HARD:   { label: 'Hard',   color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
};

export const AssessmentDetailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const queryClient = useQueryClient();
  const startAttempt = useAssessmentStore((s) => s.startAttempt);
  const clearAttempt = useAssessmentStore((s) => s.clearAttempt);

  const categoryId = location.state?.categoryId;

  const { data, isLoading: loadingTopics } = useQuery({
    queryKey: ['assessment-topics', categoryId],
    queryFn: () => assessmentApi.getTopics(categoryId),
    enabled: !!categoryId,
  });

  const topics = data?.topics || [];

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    defaultValues: { difficulty: 'MEDIUM', questionCount: 10, isPractice: false, topicId: '' },
  });

  const selectedCount = watch('questionCount');
  const selectedDifficulty = watch('difficulty');
  const selectedTopicId = watch('topicId');
  const isPractice = watch('isPractice');
  const estimatedTime = selectedCount * 2;

  const selectedTopicName = selectedTopicId
    ? topics.find((t) => t.id === selectedTopicId)?.name
    : 'All Topics (Mixed)';

  const { mutate: generate, isPending } = useMutation({
    mutationFn: async (request: CreateAssessmentRequest) => {
      const generation = await assessmentApi.generateAssessment(request);
      const attempt = await assessmentApi.startAttempt(generation.assessmentId);
      if (generation.questions.length > 0 && attempt.assessment.questions.length === 0) {
        attempt.assessment.questions = generation.questions;
        attempt.assessment.title = attempt.assessment.title || generation.assessmentTitle;
      }
      return attempt;
    },
    onSuccess: (attempt) => {
      clearAttempt();
      startAttempt(attempt);
      // Seed the query cache so the engine page never re-fetches this attempt
      queryClient.setQueryData(['assessment-attempt', attempt.id], attempt);
      navigate(`/assessments/attempt/${attempt.id}`);
    },
    onError: () => toast.error('Failed to generate assessment. Please try again.'),
  });

  const onSubmit = (formData: SetupForm) => {
    generate({
      categoryId,
      topicId: formData.topicId,
      difficulty: formData.difficulty,
      questionCount: formData.questionCount,
      timedMode: !formData.isPractice,
    });
  };

  if (!categoryId) { navigate('/assessments'); return null; }

  const cardStyle = {
    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
  };

  return (
    <AssessmentPageShell>
      <div className="max-w-[1400px] mx-auto">
        <button
          onClick={() => navigate('/assessments')}
          className={`mb-8 flex items-center gap-2 text-sm font-semibold transition-colors group ${isDark ? 'text-gray-500 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-600'}`}
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Catalog
        </button>

        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ── Main Config Form ── */}
          <div className="flex-1 w-full space-y-8 pb-20">
            <header>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Configure Assessment
              </h1>
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Tailor your preparation by selecting focus areas and difficulty level.
              </p>
            </header>

            <form id="setup-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Focus Areas */}
              <div className="rounded-2xl border p-5" style={cardStyle}>
                <div className="flex items-center justify-between mb-5">
                  <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    01 · Focus Area
                  </p>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                  >
                    Required
                  </span>
                </div>
                {loadingTopics ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => <TopicSkeleton key={i} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[{ id: '', name: 'Mixed Category', questionCount: null }, ...topics].map((topic) => {
                      const isSelected = topic.id === '' ? !selectedTopicId : selectedTopicId === topic.id;
                      return (
                        <label
                          key={topic.id || 'mixed'}
                          className="relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200"
                          style={{
                            background: isSelected
                              ? 'rgba(99,102,241,0.08)'
                              : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                            border: `1.5px solid ${isSelected ? 'rgba(99,102,241,0.4)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                          }}
                        >
                          <input type="radio" {...register('topicId')} value={topic.id} className="sr-only" />
                          <div className="flex flex-col gap-0.5">
                            <span
                              className="text-sm font-semibold"
                              style={{ color: isSelected ? '#818cf8' : isDark ? '#e5e7eb' : '#111827' }}
                            >
                              {topic.name}
                            </span>
                            <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                              {topic.questionCount != null ? `${topic.questionCount} questions` : 'All sub-topics combined'}
                            </span>
                          </div>
                          {isSelected && (
                            <div
                              className="ml-auto w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: 'rgba(99,102,241,0.2)', border: '1.5px solid #818cf8' }}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Difficulty */}
                <div className="rounded-2xl border p-5" style={cardStyle}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    02 · Challenge Level
                  </p>
                  <div
                    className="grid grid-cols-3 gap-2 p-1.5 rounded-xl"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                    }}
                  >
                    {(Object.keys(DIFFICULTY_CONFIG) as Array<keyof typeof DIFFICULTY_CONFIG>).map((lvl) => {
                      const cfg = DIFFICULTY_CONFIG[lvl];
                      const isActive = selectedDifficulty === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setValue('difficulty', lvl)}
                          className="py-2.5 rounded-lg text-xs font-bold transition-all duration-200"
                          style={isActive ? {
                            background: cfg.bg,
                            color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                          } : {
                            color: isDark ? '#6b7280' : '#9ca3af',
                          }}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question Count */}
                <div className="rounded-2xl border p-5" style={cardStyle}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    03 · Question Count
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      {...register('questionCount', { valueAsNumber: true })}
                      className="w-full rounded-xl px-4 py-3 pr-16 text-sm font-bold outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                        border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
                        color: isDark ? '#e5e7eb' : '#111827',
                      }}
                    />
                    <span
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase"
                      style={{ color: isDark ? '#4b5563' : '#9ca3af' }}
                    >
                      Items
                    </span>
                  </div>
                  {errors.questionCount && (
                    <p className="mt-2 text-xs font-medium" style={{ color: '#f87171' }}>
                      {errors.questionCount.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Practice Mode */}
              <div
                className="rounded-2xl border p-5 flex items-center justify-between gap-4"
                style={{
                  background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.03)',
                  borderColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.2)',
                }}
              >
                <div className="flex gap-4 items-center">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Practice Mode</h4>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      No timer — see explanations immediately after each answer.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" {...register('isPractice')} className="sr-only peer" />
                  <div className="w-11 h-6 rounded-full transition-all peer bg-gray-300 dark:bg-gray-700 peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-[3px] after:start-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>

            </form>
          </div>

          {/* ── Sticky Summary Panel ── */}
          <div className="w-full lg:w-80 lg:sticky lg:top-8 shrink-0">
            <div
              className="rounded-2xl border p-6"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
              }}
            >
              <h3 className={`text-sm font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Session Summary
              </h3>

              <div className="space-y-4 mb-6">
                {[
                  { label: 'Focus', value: selectedTopicName ?? '—' },
                  { label: 'Questions', value: String(selectedCount) },
                  { label: 'Duration', value: isPractice ? 'No limit' : `~${estimatedTime} min` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
                    <span className={`text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Difficulty</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                    style={{
                      background: DIFFICULTY_CONFIG[selectedDifficulty].bg,
                      color: DIFFICULTY_CONFIG[selectedDifficulty].color,
                      border: `1px solid ${DIFFICULTY_CONFIG[selectedDifficulty].border}`,
                    }}
                  >
                    {DIFFICULTY_CONFIG[selectedDifficulty].label}
                  </span>
                </div>
              </div>

              <div
                className="rounded-xl p-4 mb-6"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <div className={`flex items-center gap-2 mb-2 text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Proctoring Active
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Tab switching is monitored. Ensure a stable connection before starting.
                </p>
              </div>

              <button
                form="setup-form"
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                }}
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    Start Assessment
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </AssessmentPageShell>
  );
};
