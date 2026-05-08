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
      className="group relative rounded-2xl border p-6 transition-all duration-300 flex flex-col h-full overflow-hidden hover:scale-[1.02]"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.4)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px rgba(99,102,241,0.15)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Decorative glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" style={{ background: 'rgba(99,102,241,0.08)' }} />
      
      <div className="relative z-10 flex-1">
        <div className="flex items-start justify-between mb-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.04)',
              color: '#9ca3af',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {category.assessmentCount} Tests
          </span>
        </div>

        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors duration-300 leading-tight mb-3">
          {category.name}
        </h3>
        <p className="text-sm leading-relaxed text-gray-500 line-clamp-3">
          {category.description}
        </p>
      </div>

      <div
        className="relative z-10 mt-6 pt-5 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-600 uppercase">Topics</span>
            <span className="text-sm font-bold text-gray-300">{category.topicCount}</span>
          </div>
          <div className="h-8 w-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-600 uppercase">Level</span>
            <span className="text-xs font-bold text-indigo-400">Mixed</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-indigo-400 font-semibold text-sm group-hover:translate-x-1 transition-transform duration-300">
          Explore
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};
