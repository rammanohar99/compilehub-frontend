import React, { memo } from 'react';
import type { AssessmentQuestion, AssessmentAnswerValue } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { compareAnswers, isPartiallyCorrect as checkPartial } from '../../utils/grading';

interface QuestionReviewCardProps {
  question: AssessmentQuestion;
  userAnswer: AssessmentAnswerValue | undefined;
  index: number;
}

export const QuestionReviewCard: React.FC<QuestionReviewCardProps> = memo(({ 
  question, 
  userAnswer, 
  index 
}) => {
  const formatAnswer = (value: AssessmentAnswerValue | undefined, fallback: string) => {
    if (value === null || value === undefined) return fallback;
    if (Array.isArray(value)) return value.length ? value.join(', ') : fallback;
    if (typeof value === 'boolean') return value ? 'True' : 'False';
    if (typeof value === 'string') {
      const lowered = value.trim().toLowerCase();
      if (lowered === 'true') return 'True';
      if (lowered === 'false') return 'False';
      return value;
    }
    return String(value);
  };

  const isCorrect = compareAnswers(userAnswer, question.correctAnswer);
  const isPartiallyCorrect = !isCorrect && checkPartial(userAnswer, question.correctAnswer);

  const statusStyle = isCorrect 
    ? { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-900/30', label: 'Correct Solution' } 
    : isPartiallyCorrect 
      ? { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-900/30', label: 'Partial Success' }
      : { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-100 dark:border-red-900/30', label: 'Incorrect' };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl shadow-black/[0.02] hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-500`}>
      <div className="p-8 md:p-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-sm font-black text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
              {(index + 1).toString().padStart(2, '0')}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Knowledge Check</span>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyle.color} ${statusStyle.bg} border ${statusStyle.border}`}>
            {statusStyle.label}
          </span>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-12 font-bold text-gray-900 dark:text-white leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.text}</ReactMarkdown>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Your Submission</h4>
            <div className={`p-6 rounded-3xl border-2 text-base font-bold min-h-[80px] flex items-center ${
              isCorrect ? 'bg-emerald-50/30 border-emerald-100/50 dark:bg-emerald-500/5 dark:border-emerald-900/20 text-emerald-900 dark:text-emerald-100' : 
              isPartiallyCorrect ? 'bg-amber-50/30 border-amber-100/50 dark:bg-amber-500/5 dark:border-amber-900/20 text-amber-900 dark:text-amber-100' :
              'bg-red-50/30 border-red-100/50 dark:bg-red-500/5 dark:border-red-900/20 text-red-900 dark:text-red-100'
            }`}>
              {formatAnswer(userAnswer, 'No response provided')}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] px-1 text-right">Target Answer</h4>
            <div className="p-6 rounded-3xl border-2 border-blue-100/50 bg-blue-50/30 dark:border-blue-900/20 dark:bg-blue-500/5 text-base font-bold text-blue-900 dark:text-blue-100 min-h-[80px] flex items-center justify-end text-right">
              {formatAnswer(question.correctAnswer, 'N/A')}
            </div>
          </div>
        </div>
      </div>

      {question.explanation && (
        <div className="px-8 py-10 md:px-12 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Learning Insights</h4>
          </div>
          <div className="prose prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.explanation}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
});
QuestionReviewCard.displayName = 'QuestionReviewCard';
