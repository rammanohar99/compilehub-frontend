import React from 'react';
import { useAssessmentStore } from '../../store/assessmentStore';

export const QuestionPalette: React.FC = () => {
  const { activeAttempt, currentQuestionIndex, setCurrentQuestionIndex, localAnswers } = useAssessmentStore();

  if (!activeAttempt) return null;

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-8 pb-36 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
            Navigation
          </h3>
          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded">
            {Object.keys(localAnswers).length} / {activeAttempt.assessment.questions.length}
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-4 gap-3">
          {activeAttempt.assessment.questions.map((q, idx) => {
            const isCurrent = currentQuestionIndex === idx;
            const isAnswered = !!localAnswers[q.id];
            
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`
                  aspect-square rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center border-2
                  ${isCurrent 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110 z-10' 
                    : isAnswered
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-blue-500/30 hover:text-blue-500'
                  }
                `}
              >
                {(idx + 1).toString().padStart(2, '0')}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 space-y-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guide</h4>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" /> Current Position
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Response Recorded
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-800" /> Not Attempted
          </div>
        </div>
      </div>
    </aside>
  );
};
