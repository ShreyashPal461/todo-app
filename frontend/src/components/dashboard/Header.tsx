import React from 'react';
import { User } from '../../context/AuthContext';

interface HeaderProps {
  user: User | null;
  logout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isDark: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  logout,
  searchQuery,
  setSearchQuery,
  theme,
  toggleTheme,
  isDark,
}) => {
  return (
    <header className="border-b border-slate-100 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-5 py-3.5 transition-colors duration-300">
      
      {/* Search & Breadcrumbs */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        {/* Mobile Logo Brand */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-slate-950 dark:bg-slate-50 flex items-center justify-center font-bold text-xs text-white dark:text-slate-950 border border-slate-800 dark:border-slate-200">
            A
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, categories..."
            className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 transition duration-150 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Settings / Controls */}
      <div className="flex items-center gap-3">
        {/* Breadcrumb Info Label */}
        <span className="hidden md:inline text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
          Private Suite Board
        </span>

        {/* 🌗 Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Mobile Profile & Logout */}
        {user && (
          <div className="flex items-center gap-2 lg:hidden">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
              {user.username}
            </span>
            <button
              onClick={logout}
              className="px-2.5 py-1 text-[10px] font-bold rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition border border-rose-500/20"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
