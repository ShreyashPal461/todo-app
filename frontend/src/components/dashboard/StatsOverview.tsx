import React from 'react';

interface StatsOverviewProps {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  completionPercentage: number;
  activeCategoryName: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalCount,
  completedCount,
  pendingCount,
  completionPercentage,
  activeCategoryName,
}) => {
  return (
    <section className="space-y-4">
      {/* Dynamic Workspace Title Board */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {activeCategoryName} Board
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-500 dark:text-indigo-400 tracking-wider uppercase">
              Private
            </span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Manage, filter, and securely organize your tasks in real-time.
          </p>
        </div>

        {/* Circular Progress & Metrics Card */}
        <div className="border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 rounded-xl p-3.5 flex items-center gap-4 flex-shrink-0 transition-all duration-300">
          <div className="relative h-11 w-11 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="22"
                cy="22"
                r="18"
                className="stroke-slate-100 dark:stroke-slate-900"
                strokeWidth="2.5"
                fill="transparent"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                className="stroke-emerald-500 transition-all duration-500"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray="113"
                strokeDashoffset={113 - (113 * completionPercentage) / 100}
              />
            </svg>
            <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-100">
              {completionPercentage}%
            </span>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-600 tracking-wider">Completion</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Key Metrics Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 rounded-xl p-3.5 space-y-1 transition duration-150">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total</span>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-none">{totalCount}</p>
        </div>
        <div className="border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 rounded-xl p-3.5 space-y-1 transition duration-150">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Active</span>
          <p className="text-lg font-bold text-amber-500 dark:text-amber-500 leading-none">{pendingCount}</p>
        </div>
        <div className="border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 rounded-xl p-3.5 space-y-1 transition duration-150">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Done</span>
          <p className="text-lg font-bold text-emerald-500 dark:text-emerald-500 leading-none">{completedCount}</p>
        </div>
      </div>
    </section>
  );
};
