import React from 'react';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useAssessmentSubmission } from '../../hooks/useAssessmentSubmission';
import { SubmissionModal } from './SubmissionModal';

export const AttemptFooter: React.FC = () => {
  const { activeAttempt, currentQuestionIndex, setCurrentQuestionIndex, localAnswers } = useAssessmentStore();
  const { 
    isSubmitting, 
    isConfirmModalOpen, 
    setIsConfirmModalOpen, 
    handleConfirmSubmit 
  } = useAssessmentSubmission();

  if (!activeAttempt) return null;

  const isFirst = currentQuestionIndex === 0;
  const isLast = currentQuestionIndex === activeAttempt.assessment.questions.length - 1;
  const unansweredCount = activeAttempt.assessment.questions.length - Object.keys(localAnswers).length;

  return (
    <footer className="sticky bottom-0 z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-6 sm:px-12 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={isFirst || isSubmitting}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-black transition-all border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <div className="flex flex-col-reverse sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-black bg-amber-50 dark:bg-amber-500/5 text-amber-600 dark:text-amber-500 border-2 border-amber-100 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Review Later
          </button>
          
          {isLast ? (
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-12 py-3.5 rounded-2xl text-sm font-black bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finalizing...
                </>
              ) : (
                <>
                  Submit Assessment
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-10 py-3.5 rounded-2xl text-sm font-black bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-3 group"
            >
              Next Question
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <SubmissionModal
        isOpen={isConfirmModalOpen}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setIsConfirmModalOpen(false)}
        isSubmitting={isSubmitting}
        unansweredCount={unansweredCount}
      />
    </footer>
  );
};
