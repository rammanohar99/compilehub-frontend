import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assessmentApi } from '../api/assessments';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { useTheme } from '../../../hooks/useTheme';

export const AssessmentDashboardWidgets: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['assessment-history-dashboard'],
    queryFn: () => assessmentApi.getHistory({ limit: 3 }),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['assessment-analytics-dashboard'],
    queryFn: () => assessmentApi.getAnalytics(),
  });

  if (historyLoading || analyticsLoading) {
    return (
      <div className="h-48 flex items-center justify-center bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const recentAttempts = history?.attempts || [];
  const hasNoAttempts = recentAttempts.length === 0;

  if (hasNoAttempts) {
    return (
      <div 
        className="rounded-2xl p-8 border border-dashed text-center flex flex-col items-center justify-center gap-4 group hover:border-blue-500/50 transition-colors"
        style={{
          background: isDark ? 'rgba(59,130,246,0.03)' : 'rgba(59,130,246,0.02)',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
        }}
      >
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-500">
           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ready for your first interview?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
            Validate your skills with a timed technical assessment and get instant feedback.
          </p>
        </div>
        <Link 
          to="/assessments" 
          className="mt-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
        >
          Explore Assessments
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Recent Attempts */}
      <div
        className="rounded-2xl border overflow-hidden flex flex-col"
        style={{
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
        }}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Assessment History</h3>
          <Link to="/assessments" className="text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">
            All →
          </Link>
        </div>
        <div className="flex-1">
          {recentAttempts.map((attempt) => (
            <Link
              key={attempt.id}
              to={`/assessments/results/${attempt.id}`}
              className={`flex items-center justify-between gap-4 px-5 py-3 border-b transition-colors group last:border-0 ${
                isDark ? 'border-white/3 hover:bg-white/3' : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                  {attempt.assessmentTitle}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{attempt.category}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <span className="text-[10px] text-gray-400">
                    {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-black text-blue-600 dark:text-blue-400">{attempt.score}/{attempt.totalPoints}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">Score</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Performance Snapshot */}
      <div
        className="rounded-2xl p-6 border flex flex-col justify-between group"
        style={{
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Assessment IQ</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Global Performance</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
           <div>
              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                {(analytics?.averageScore ?? 0).toFixed(0)}%
              </span>
              <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] mt-1">Avg. Accuracy</span>
           </div>
           <div>
              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                {analytics?.totalAttempts ?? 0}
              </span>
              <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] mt-1">Completed</span>
           </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
           <Link to="/assessments" className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
              Start New Test
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
           </Link>
        </div>
      </div>
    </div>
  );
};
