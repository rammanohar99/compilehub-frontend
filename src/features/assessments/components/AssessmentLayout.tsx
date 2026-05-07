import React from 'react';
import { Outlet } from 'react-router-dom';

export const AssessmentLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Outlet />
    </div>
  );
};

export const AssessmentPageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-[5%] py-12">
        {children}
      </div>
    </div>
  );
};
