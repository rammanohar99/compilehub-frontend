import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assessmentApi } from '../api/assessments';
import { useAssessmentStore } from '../store/assessmentStore';
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

export const AssessmentDetailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
    defaultValues: {
      difficulty: 'MEDIUM',
      questionCount: 10,
      isPractice: false,
      topicId: '',
    }
  });

  const selectedCount = watch('questionCount');
  const selectedDifficulty = watch('difficulty');
  const selectedTopicId = watch('topicId');
  const isPractice = watch('isPractice');
  const estimatedTime = selectedCount * 2;

  const selectedTopicName = selectedTopicId 
    ? topics.find(t => t.id === selectedTopicId)?.name 
    : 'All Topics (Mixed)';

  const { mutate: generate, isPending } = useMutation({
    mutationFn: async (request: CreateAssessmentRequest) => {
      // 1. Generate assessment
      const generation = await assessmentApi.generateAssessment(request);
      // 2. Start attempt session
      return assessmentApi.startAttempt(generation.assessmentId);
    },
    onSuccess: (attempt) => {
      clearAttempt();
      startAttempt(attempt);
      navigate(`/assessments/attempt/${attempt.id}`);
    },
    onError: () => {
      toast.error('Failed to generate assessment. Please try again.');
    }
  });

  const onSubmit = (data: SetupForm) => {
    generate({
      categoryId,
      topicId: data.topicId,
      difficulty: data.difficulty,
      questionCount: data.questionCount,
      timedMode: !data.isPractice,
    });
  };

  if (!categoryId) {
    navigate('/assessments');
    return null;
  }

  return (
    <AssessmentPageShell>
      <div className="max-w-[1400px] mx-auto">
        <button 
          onClick={() => navigate('/assessments')}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-500 transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Catalog
        </button>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Main Config Form */}
          <div className="flex-1 w-full space-y-10 pb-20">
            <header>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Configure Assessment</h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Tailor your preparation by selecting focus areas and difficulty level.
              </p>
            </header>

            <form id="setup-form" onSubmit={handleSubmit(onSubmit)} className="space-y-12">
              {/* Topic Selection */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">01. Focus Areas</h3>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded">Required</span>
                </div>
                {loadingTopics ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <TopicSkeleton key={i} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`relative flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                      !selectedTopicId 
                        ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/5 shadow-md shadow-blue-500/5' 
                        : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}>
                      <input type="radio" {...register('topicId')} value="" className="sr-only" />
                      <div className="flex flex-col gap-1">
                        <span className={`text-sm font-bold ${!selectedTopicId ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>Mixed Category</span>
                        <span className="text-xs text-gray-500">Comprehensive coverage across all sub-topics.</span>
                      </div>
                    </label>
                    {topics.map((topic) => (
                      <label key={topic.id} className={`relative flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                        selectedTopicId === topic.id 
                          ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/5 shadow-md shadow-blue-500/5' 
                          : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}>
                        <input type="radio" {...register('topicId')} value={topic.id} className="sr-only" />
                        <div className="flex flex-col gap-1">
                          <span className={`text-sm font-bold ${selectedTopicId === topic.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{topic.name}</span>
                          <span className="text-xs text-gray-500">{topic.questionCount} available questions.</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Difficulty */}
                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">02. Challenge Level</h3>
                  <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                    {['EASY', 'MEDIUM', 'HARD'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setValue('difficulty', lvl as any)}
                        className={`py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                          selectedDifficulty === lvl 
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm ring-1 ring-black/5' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Question Count */}
                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">03. Question Count</h3>
                  <div className="relative group">
                    <input 
                      type="number" 
                      {...register('questionCount', { valueAsNumber: true })}
                      className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">Items</span>
                  </div>
                  {errors.questionCount && (
                    <p className="mt-2 text-xs text-red-500 font-medium">{errors.questionCount.message}</p>
                  )}
                </section>
              </div>

              {/* Practice Mode */}
              <section className="p-6 bg-blue-50/30 dark:bg-blue-500/5 rounded-3xl border-2 border-blue-100/50 dark:border-blue-500/10 flex items-center justify-between">
                <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Enable Practice Mode</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-md leading-relaxed">Questions will not be timed, and you'll see explanations immediately after answering each question.</p>
                   </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    {...register('isPractice')}
                    className="sr-only peer" 
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[19px] after:w-[19px] after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </section>
            </form>
          </div>

          {/* Sticky Summary Panel */}
          <div className="w-full lg:w-96 lg:sticky lg:top-8">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-xl shadow-blue-500/[0.03]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8">Session Summary</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-400">Target Focus</span>
                  <span className="text-gray-900 dark:text-white text-right max-w-[150px] truncate">{selectedTopicName}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-400">Difficulty</span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    selectedDifficulty === 'EASY' ? 'bg-emerald-50 text-emerald-600' :
                    selectedDifficulty === 'MEDIUM' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {selectedDifficulty}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-400">Questions</span>
                  <span className="text-gray-900 dark:text-white font-bold">{selectedCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-400">Estimated Duration</span>
                  <span className="text-gray-900 dark:text-white font-bold">{isPractice ? 'No limit' : `${estimatedTime} Minutes`}</span>
                </div>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl mb-10 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider">Proctoring Active</span>
                </div>
                <p className="text-[11px] leading-relaxed text-gray-400">
                  Tab switching and multi-monitor setups are monitored. Ensure a stable connection before starting.
                </p>
              </div>

              <button
                form="setup-form"
                type="submit"
                disabled={isPending}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-[1.25rem] font-bold text-lg shadow-2xl shadow-blue-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden relative group"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Assembling Test...</span>
                  </>
                ) : (
                  <>
                    <span>Initialize Attempt</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
