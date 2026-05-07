import React, { memo } from 'react';
import type { AssessmentQuestion, AssessmentAnswerValue } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QuestionRendererProps {
  question: AssessmentQuestion;
  answer: AssessmentAnswerValue | undefined;
  onChange: (answer: AssessmentAnswerValue) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = memo(({ question, answer, onChange }) => {
  const { type, text, options, scenarioContext } = question;

  const renderOptions = (isMulti: boolean) => (
    <div className="grid grid-cols-1 gap-4 mt-8">
      {options?.map((option: string, idx: number) => {
        const isSelected = isMulti 
          ? Array.isArray(answer) && (answer as string[]).includes(option)
          : answer === option;

        const toggleOption = () => {
          if (isMulti) {
            const current = Array.isArray(answer) ? (answer as string[]) : [];
            const next = current.includes(option)
              ? current.filter(o => o !== option)
              : [...current, option];
            onChange(next);
          } else {
            onChange(option);
          }
        };

        return (
          <button
            key={idx}
            onClick={toggleOption}
            className={`
              flex items-start gap-5 p-6 rounded-3xl border-2 text-left transition-all duration-300 group relative overflow-hidden
              ${isSelected 
                ? 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-500 ring-4 ring-blue-500/5 shadow-md' 
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900/30'
              }
            `}
          >
            {/* Hover Indicator */}
            {!isSelected && <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.02] transition-colors" />}

            <div className={`
              w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center border-2 transition-all duration-300 mt-0.5
              ${isSelected 
                ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg shadow-blue-600/30' 
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 group-hover:border-blue-400 group-hover:bg-white dark:group-hover:bg-gray-700'
              }
            `}>
              {isMulti ? (
                isSelected ? (
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-black text-gray-300 group-hover:text-blue-400">A{idx + 1}</span>
                )
              ) : (
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isSelected ? 'bg-white scale-100' : 'bg-transparent scale-0'}`} />
              )}
            </div>
            
            <div className="flex-1 space-y-1">
               <span className={`text-base font-bold leading-relaxed transition-colors ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>
                 {option}
               </span>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {scenarioContext && (
        <section className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-500/5 dark:to-blue-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
          {/* Decorative Context Tag */}
          <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-3xl shadow-lg shadow-indigo-500/20">
            Scenario Context
          </div>

          <div className="prose prose-base dark:prose-invert max-w-none text-indigo-900/80 dark:text-indigo-100/70 leading-relaxed italic font-serif">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{scenarioContext}</ReactMarkdown>
          </div>
        </section>
      )}

      <section>
        <div className="flex items-start gap-8 mb-10">
          <div className="flex-shrink-0 w-14 h-14 rounded-3xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center font-black text-2xl shadow-2xl shadow-black/10 dark:shadow-white/5 rotate-3 hover:rotate-0 transition-transform duration-500">
            Q
          </div>
          <div className="prose prose-xl dark:prose-invert max-w-none font-bold text-gray-900 dark:text-white leading-[1.4]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        </div>

        {(type === 'MCQ' || type === 'MULTI_SELECT' || type === 'TRUE_FALSE') && renderOptions(type === 'MULTI_SELECT')}
        
        {type === 'SCENARIO_BASED' && (
          <div className="mt-10 space-y-4">
             <div className="relative group">
               <textarea
                  value={(answer as string) || ''}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Type your structured analysis and solution here..."
                  className="w-full h-80 p-8 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border-2 border-gray-100 dark:border-gray-800 rounded-[2.5rem] focus:border-blue-500 focus:ring-[12px] focus:ring-blue-500/5 outline-none transition-all resize-none font-medium text-lg leading-relaxed shadow-sm group-hover:border-gray-200 dark:group-hover:border-gray-700 caret-blue-500"
               />
               <div className="absolute bottom-6 right-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/80 dark:bg-gray-950/80 backdrop-blur px-3 py-1 rounded-full border border-gray-100 dark:border-gray-800">
                 Markdown Supported
               </div>
             </div>
             <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                   Continuous Autosave Active • Last sync: just now
                </p>
             </div>
          </div>
        )}
      </section>
    </div>
  );
});
QuestionRenderer.displayName = 'QuestionRenderer';
