import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assessmentApi } from '../api/assessments';
import { AssessmentPageShell } from '../components/AssessmentLayout';
import { ResultStatCard, BreakdownBar } from '../components/results/ResultStats';
import { QuestionReviewCard } from '../components/results/QuestionReviewCard';
import { PageLoader } from '../../../components/LoadingSpinner';
import { compareAnswers } from '../utils/grading';

export const AssessmentResultsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: attempt, isLoading, isError } = useQuery({
    queryKey: ['assessment-attempt-results', id],
    queryFn: () => assessmentApi.getAttempt(id!),
    enabled: !!id,
  });

  if (isLoading) return <PageLoader />;

  if (isError || !attempt || attempt.status !== 'COMPLETED') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-12">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mb-10 text-red-500 shadow-inner">
           <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Result Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
          The requested assessment report is either unavailable or the attempt session is still active.
        </p>
        <button 
          onClick={() => navigate('/assessments')}
          className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-[0.98]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const score = attempt.score || 0;
  const totalPoints = attempt.totalPoints;
  const questions = attempt.assessment.questions;
  const completedAt = attempt.completedAt || attempt.endsAt || attempt.startedAt;
  const correctCount = attempt.correctAnswersCount ?? score ?? 0;
  const accuracy = typeof attempt.accuracy === 'number'
    ? attempt.accuracy
    : questions.length > 0
      ? (correctCount / questions.length) * 100
      : 0;
  
  // Calculate Topic Mastery
  const topicStats: Record<string, { total: number; correct: number }> = {};
  questions.forEach(q => {
    const topic = q.topic || 'General Knowledge';
    if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 };
    topicStats[topic].total++;
    if (compareAnswers(attempt.answerEvents[q.id], q.correctAnswer)) {
      topicStats[topic].correct++;
    }
  });

  // Calculate Difficulty Mastery
  const difficultyStats: Record<string, { total: number; correct: number }> = {
    'EASY': { total: 0, correct: 0 },
    'MEDIUM': { total: 0, correct: 0 },
    'HARD': { total: 0, correct: 0 }
  };
  
  questions.forEach(q => {
    const diff = attempt.difficulty;
    if (difficultyStats[diff]) {
        difficultyStats[diff].total++;
        if (compareAnswers(attempt.answerEvents[q.id], q.correctAnswer)) {
            difficultyStats[diff].correct++;
        }
    }
  });

  const isExcellent = accuracy >= 80;

  return (
    <AssessmentPageShell>
      <div className="max-w-[1400px] mx-auto pb-32">
        <header className="mb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                 Verification Complete
              </div>
              <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 text-6xl">Report.</span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-400 font-bold text-sm">
                <span>{attempt.assessment.title}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800" />
                <span>Completed {new Date(completedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/assessments')}
              className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-black text-gray-500 hover:border-blue-500/30 hover:text-blue-500 transition-all group shadow-sm"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Assessment Catalog
            </button>
          </div>
        </header>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <ResultStatCard 
            label="Verified Score" 
            value={`${score}/${totalPoints}`}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-2.06 3.42 3.42 0 014.438 0c.64.48 1.343.834 2.096 1.05a3.42 3.42 0 012.39 3.064c.045.81.285 1.62.71 2.33a3.42 3.42 0 010 3.716c-.425.71-.665 1.52-.71 2.33a3.42 3.42 0 01-2.39 3.064c-.753.216-1.456.57-2.096 1.05a3.42 3.42 0 01-4.438 0c-.64-.48-1.343-.834-2.096-1.05a3.42 3.42 0 01-2.39-3.064c-.045-.81-.285-1.62-.71-2.33a3.42 3.42 0 010-3.716c.425-.71.665-1.52.71-2.33a3.42 3.42 0 012.39-3.064c.753-.216 1.456-.57 2.096-1.05z" /></svg>}
            trend={{ value: isExcellent ? 'Exceptional' : 'Proficient', isPositive: isExcellent }}
          />
          <ResultStatCard 
            label="Total Accuracy" 
            value={`${accuracy.toFixed(0)}%`}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          />
          <ResultStatCard 
            label="Correct Items" 
            value={`${correctCount}/${questions.length}`}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <ResultStatCard 
            label="Time Efficiency" 
            value="Optimal" 
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Side Analysis */}
          <div className="w-full lg:w-96 space-y-10 lg:sticky lg:top-8">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-10 shadow-xl shadow-blue-500/[0.02]">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">Syllabus Mastery</h3>
              <div className="space-y-10">
                {Object.entries(topicStats).map(([topic, stats]) => (
                  <BreakdownBar 
                    key={topic} 
                    label={topic} 
                    total={stats.total} 
                    correct={stats.correct} 
                    color={stats.correct / stats.total >= 0.7 ? '#3b82f6' : '#f59e0b'} 
                  />
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-10 shadow-xl shadow-blue-500/[0.02]">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">Depth Analysis</h3>
              <div className="space-y-10">
                {Object.entries(difficultyStats)
                  .filter(([_, stats]) => stats.total > 0)
                  .map(([diff, stats]) => (
                  <BreakdownBar 
                    key={diff} 
                    label={`${diff.charAt(0)}${diff.slice(1).toLowerCase()} Tier`} 
                    total={stats.total} 
                    correct={stats.correct} 
                    color={diff === 'EASY' ? '#10b981' : diff === 'MEDIUM' ? '#3b82f6' : '#ef4444'} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Review List */}
          <div className="flex-1 w-full space-y-10">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                Knowledge Gaps & Feedback
                <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-black text-gray-400">
                  {questions.length}
                </span>
              </h3>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Correct
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Incorrect
                 </div>
              </div>
            </div>
            
            <div className="space-y-10">
              {questions.map((q, idx) => (
                <QuestionReviewCard 
                  key={q.id}
                  index={idx}
                  question={q}
                  userAnswer={attempt.answerEvents[q.id]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AssessmentPageShell>
  );
};
