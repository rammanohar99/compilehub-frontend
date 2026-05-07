import React from 'react';
import { Link } from 'react-router-dom';
import type { AssessmentCategory } from '../types';

interface CategoryCardProps {
  category: AssessmentCategory;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      to={`/assessments/${category.slug}`}
      state={{ categoryId: category.id }}
      className="group relative bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-200 dark:border-gray-800 p-8 hover:border-blue-500/50 hover:shadow-[0_20px_50px_rgba(59,130,246,0.12)] transition-all duration-500 flex flex-col h-full overflow-hidden"
    >
      {/* Decorative Background Element */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500" />
      
      <div className="relative z-10 flex-1">
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-800">
            {category.assessmentCount} Tests
          </span>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors duration-300 leading-tight">
          {category.name}
        </h3>
        <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
          {category.description}
        </p>
      </div>

      <div className="relative z-10 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Topics</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{category.topicCount}</span>
          </div>
          <div className="h-8 w-px bg-gray-100 dark:border-gray-800" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Level</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Mixed</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:translate-x-1 transition-transform duration-300">
          Explore
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};
