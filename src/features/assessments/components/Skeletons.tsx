import React from 'react';

export const AssessmentSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
    <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded mb-2" />
    <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-800 rounded mb-6" />
    <div className="flex justify-between items-center">
      <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
      <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
    </div>
  </div>
);

export const TopicSkeleton: React.FC = () => (
  <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
);
