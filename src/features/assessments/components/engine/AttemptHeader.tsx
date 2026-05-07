import React from 'react';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useAssessmentTimer } from '../../hooks/useAssessmentTimer';
import { formatTime } from '../../utils/timer';
import toast from 'react-hot-toast';
import { useAssessmentSubmission } from '../../hooks/useAssessmentSubmission';

export const AttemptHeader: React.FC = () => {
  const activeAttempt = useAssessmentStore((s) => s.activeAttempt);
  const localAnswers = useAssessmentStore((s) => s.localAnswers);
  const syncStatus = useAssessmentStore((s) => s.syncStatus);
  const { forceSubmit } = useAssessmentSubmission();

  const { timeLeft, urgency } = useAssessmentTimer({
    endsAt: activeAttempt?.timedMode ? activeAttempt?.endsAt : undefined,
    onExpire: () => {
      toast.error('Time expired! Your assessment is being submitted.', { id: 'timeout' });
      forceSubmit();
    }
  });

  if (!activeAttempt) return null;

  const totalQuestions = activeAttempt.assessment.questions.length;
  const answeredCount = Object.keys(localAnswers).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between gap-6">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-6 min-w-0">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic">CH</div>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-2" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 dark:text-white truncate text-base sm:text-lg">
              {activeAttempt.assessment.title}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                activeAttempt.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-600' :
                activeAttempt.difficulty === 'MEDIUM' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
              }`}>
                {activeAttempt.difficulty}
              </span>
              <div className="flex items-center gap-1.5">
                {syncStatus === 'saving' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase animate-pulse">
                    <span className="w-1 h-1 rounded-full bg-blue-500" />
                    Syncing
                  </span>
                )}
                {syncStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                    Autosaved
                  </span>
                )}
                {syncStatus === 'offline' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase">
                    <span className="w-1 h-1 rounded-full bg-amber-500" />
                    Offline
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Progress (Desktop) */}
        <div className="hidden lg:flex flex-col items-center gap-2 flex-1 max-w-md">
           <div className="flex justify-between w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Current Progress</span>
              <span>{answeredCount} / {totalQuestions} Answered</span>
           </div>
           <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                style={{ width: `${progressPercent}%` }}
              />
           </div>
        </div>

        {/* Right: Timer */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className={`
            flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all duration-500
            ${activeAttempt.timedMode && urgency === 'danger' 
              ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite]' 
              : activeAttempt.timedMode && urgency === 'warning'
                ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white shadow-sm'
            }
          `}>
            <svg className={`w-5 h-5 ${activeAttempt.timedMode && urgency === 'danger' ? 'text-red-500' : activeAttempt.timedMode && urgency === 'warning' ? 'text-amber-500' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono text-xl font-black tracking-tighter">
              {activeAttempt.timedMode ? formatTime(timeLeft) : 'No limit'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
