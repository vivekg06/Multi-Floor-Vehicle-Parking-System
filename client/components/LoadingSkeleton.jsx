import React from 'react';

export const DashboardCardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="animate-pulse glass-card p-6 h-32 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          </div>
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};
