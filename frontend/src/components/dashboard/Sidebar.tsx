import React from 'react';
import { User } from '../../context/AuthContext';

interface SidebarProps {
  user: User | null;
  logout: () => void;
  filterTab: 'all' | 'pending' | 'completed';
  setFilterTab: (tab: 'all' | 'pending' | 'completed') => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  totalCount: number;
  pendingCount: number;
  completedCount: number;
  isDark: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  logout,
  filterTab,
  setFilterTab,
  activeCategory,
  setActiveCategory,
  totalCount,
  pendingCount,
  completedCount,
  isDark,
}) => {
  const categories = [
    { name: 'All Tasks', id: 'all', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    )},
    { name: 'Work', id: 'Work', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )},
    { name: 'Personal', id: 'Personal', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )},
    { name: 'Ideas', id: 'Ideas', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l.707-.707m2.828 9.9a5 5 0 113.586 0z" />
      </svg>
    )},
  ];

  return (
    <aside className="hidden lg:flex w-64 border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 flex-col p-5 space-y-6 z-20 flex-shrink-0 transition-colors duration-300">
      
      {/* Brand Section */}
      <div className="flex items-center gap-2.5 px-1">
        <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-slate-50 flex items-center justify-center font-black text-sm text-white dark:text-slate-950 border border-slate-800 dark:border-slate-200">
          A
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">AeroTask</h1>
          <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-600 font-extrabold">Creative Suite</p>
        </div>
      </div>

      {/* Workspace Switcher */}
      <div className="group flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition duration-150">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[9px] text-slate-600 dark:text-slate-400 font-bold border border-slate-300/30">M</div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">My Workspace</span>
        </div>
        <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4 4 4-4" />
        </svg>
      </div>

      {/* Quick Filters / Status */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-2 block mb-2">Folders</span>
        
        <button
          onClick={() => setFilterTab('all')}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition duration-150 font-medium text-xs ${
            filterTab === 'all'
              ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <span>Inbox</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200/50 dark:bg-slate-900 border border-slate-300/10 text-slate-600 dark:text-slate-400">{totalCount}</span>
        </button>

        <button
          onClick={() => setFilterTab('pending')}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition duration-150 font-medium text-xs ${
            filterTab === 'pending'
              ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Active</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-500/90">{pendingCount}</span>
        </button>

        <button
          onClick={() => setFilterTab('completed')}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition duration-150 font-medium text-xs ${
            filterTab === 'completed'
              ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Completed</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-500/90">{completedCount}</span>
        </button>
      </div>

      {/* Category Folders */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-2 block mb-2">Workspace Categories</span>
        
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition duration-150 font-medium text-xs ${
              activeCategory === cat.id
                ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <span className={activeCategory === cat.id ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}>
              {cat.icon}
            </span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Footer User Panel */}
      {user && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-900 space-y-3.5 mt-auto">
          <div className="flex items-center gap-2.5 px-1">
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate leading-none mb-1">{user.username}</p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate leading-none">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-900 hover:border-rose-500/20 dark:hover:border-rose-500/20 hover:text-rose-500 text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-rose-500/5 transition duration-150 bg-transparent text-slate-600 dark:text-slate-400"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
};
