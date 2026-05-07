import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const ResultStatCard: React.FC<StatCardProps> = ({ label, value, icon, trend }) => (
  <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-xl shadow-blue-500/[0.02] flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-500">
    <div className="flex items-center justify-between mb-8">
      <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      {trend && (
        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
          trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {trend.value}
        </span>
      )}
    </div>
    <div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2">{label}</span>
      <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</span>
    </div>
  </div>
);

interface BreakdownItemProps {
  label: string;
  total: number;
  correct: number;
  color: string;
}

export const BreakdownBar: React.FC<BreakdownItemProps> = ({ label, total, correct, color }) => {
  const percent = total > 0 ? (correct / total) * 100 : 0;
  
  return (
    <div className="group">
      <div className="flex justify-between text-xs font-bold mb-3 uppercase tracking-widest">
        <span className="text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
        <span className="text-gray-400">{correct} / {total} <span className="text-gray-200 dark:text-gray-800 mx-1">•</span> {percent.toFixed(0)}%</span>
      </div>
      <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-50 dark:border-gray-800">
        <div 
          className="h-full transition-all duration-[1.5s] ease-out rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};
