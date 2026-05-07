import React from 'react';
import { createPortal } from 'react-dom';

interface SubmissionModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  unansweredCount: number;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  isSubmitting,
  unansweredCount
}) => {
  if (!isOpen) return null;
  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] sm:rounded-[3rem] border border-gray-100 dark:border-gray-800 p-6 sm:p-10 md:p-12 max-w-xl w-full max-h-[90vh] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-500 relative">
        
        {/* Decorative Background Icon */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/[0.03] rounded-full flex items-center justify-center text-blue-500/10 rotate-12 pointer-events-none overflow-hidden">
           <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
        </div>

        <div className="relative z-10 text-center overflow-y-auto max-h-[calc(90vh-3rem)]">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center mb-8 mx-auto text-blue-600 dark:text-blue-400 shadow-inner">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Ready to Finalize?
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-8 sm:mb-10 leading-relaxed max-w-sm mx-auto font-medium">
            Review your answers one last time. Once submitted, your attempt will be locked and graded instantly.
          </p>

          {unansweredCount > 0 && (
            <div className="mb-10 p-6 bg-amber-50 dark:bg-amber-500/5 rounded-[2rem] border-2 border-amber-100 dark:border-amber-500/10 flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-amber-500/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900 dark:text-amber-100 uppercase tracking-tighter">Action Required</h4>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/60 font-bold leading-tight">
                  You have <span className="text-amber-600 dark:text-amber-400 underline decoration-2 underline-offset-2">{unansweredCount} unanswered</span> {unansweredCount === 1 ? 'question' : 'questions'} remaining.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:gap-4">
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-[1.5rem] font-black text-lg shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Finalizing Submission...</span>
                </>
              ) : (
                'Yes, Submit My Attempt'
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-[1.25rem] font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 border border-gray-100 dark:border-gray-700"
            >
              Return to Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
