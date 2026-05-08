import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assessmentApi } from '../api/assessments';
import { CategoryCard } from '../components/CategoryCard';
import { AssessmentSkeleton } from '../components/Skeletons';
import { AssessmentPageShell } from '../components/AssessmentLayout';

export const AssessmentListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['assessment-categories'],
    queryFn: assessmentApi.getCategories,
  });

  const categories = data?.categories || [];

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AssessmentPageShell>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 mb-12 sm:mb-16">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-4 block">
            Knowledge Validation
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            Assessments <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">& Mock Interviews</span>
          </h1>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Choose a category to start a timed technical assessment. Our proctored engine simulates real interview environments to help you prepare effectively.
          </p>
        </div>

        <div className="relative w-full lg:w-80 group">
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1.5px solid rgba(255,255,255,0.08)',
              color: '#e5e7eb',
            }}
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => <AssessmentSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-24 bg-red-50 dark:bg-red-950/10 rounded-[2.5rem] border-2 border-dashed border-red-100 dark:border-red-900/30">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Connectivity Issue</h3>
          <p className="text-red-600/70 dark:text-red-400/70 font-medium mb-8">We couldn't load the assessment catalog at this time.</p>
          <button 
            onClick={() => refetch()}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-red-600/20"
          >
            Try Reconnecting
          </button>
        </div>
      ) : filteredCategories?.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 dark:bg-gray-900/30 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Results Found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">We couldn't find any categories matching "{search}". Try searching for broader terms.</p>
          <button 
            onClick={() => setSearch('')}
            className="mt-8 text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredCategories?.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </AssessmentPageShell>
  );
};
