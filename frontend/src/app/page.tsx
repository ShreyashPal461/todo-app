'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Todo {
  id: number;
  documentId: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Dashboard() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Theme State: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showCompletedList, setShowCompletedList] = useState(true);

  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('app-theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('app-theme', nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'info');
  };

  // Toast Notification trigger
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('http://localhost:1337/api/todos?sort=createdAt:desc', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to fetch tasks.');
      }

      setTodos(data.data || []);
    } catch (err: any) {
      showToast(err.message || 'Could not connect to server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTodos();
    }
  }, [token, fetchTodos]);

  // Create a new todo
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !token) return;

    const currentTitle = title;
    setTitle(''); // Snappy UX input clear

    try {
      setActionLoading('create');
      const res = await fetch('http://localhost:1337/api/todos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            title: currentTitle,
            isCompleted: false,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to add task.');
      }

      setTodos((prev) => [data.data, ...prev]);
      showToast('Task added successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to add task.', 'error');
      setTitle(currentTitle); // rollback
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle status
  const handleToggleStatus = async (todo: Todo) => {
    if (!token) return;

    const originalStatus = todo.isCompleted;
    const nextStatus = !originalStatus;

    // Optimistic UI updates
    setTodos((prev) =>
      prev.map((t) => (t.documentId === todo.documentId ? { ...t, isCompleted: nextStatus } : t))
    );

    try {
      setActionLoading(todo.documentId);
      const res = await fetch(`http://localhost:1337/api/todos/${todo.documentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            isCompleted: nextStatus,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to update task.');
      }

      setTodos((prev) =>
        prev.map((t) => (t.documentId === todo.documentId ? data.data : t))
      );
      showToast(nextStatus ? 'Task completed!' : 'Task marked as pending.');
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle status.', 'error');
      // Rollback
      setTodos((prev) =>
        prev.map((t) => (t.documentId === todo.documentId ? { ...t, isCompleted: originalStatus } : t))
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Delete task
  const handleDeleteTodo = async (todo: Todo) => {
    if (!token) return;

    const originalTodos = [...todos];
    setTodos((prev) => prev.filter((t) => t.documentId !== todo.documentId));

    try {
      setActionLoading(todo.documentId);
      const res = await fetch(`http://localhost:1337/api/todos/${todo.documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete task.');
      }
      showToast('Task deleted permanently.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task.', 'error');
      setTodos(originalTodos); // Rollback
    } finally {
      setActionLoading(null);
    }
  };

  // Memoized Search & Tab Filter logic
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (filterTab === 'all') return matchesSearch;
      if (filterTab === 'pending') return matchesSearch && !todo.isCompleted;
      if (filterTab === 'completed') return matchesSearch && todo.isCompleted;
      return matchesSearch;
    });
  }, [todos, searchQuery, filterTab]);

  // Split Active and Completed for professional task layout
  const activeTodos = useMemo(() => filteredTodos.filter(t => !t.isCompleted), [filteredTodos]);
  const completedTodos = useMemo(() => filteredTodos.filter(t => t.isCompleted), [filteredTodos]);

  // Metrics
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.isCompleted).length;
  const pendingCount = totalCount - completedCount;
  
  // Progress Ring Calculation
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-teal-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-slate-400 font-semibold tracking-wide animate-pulse">Establishing Secure Session...</span>
        </div>
      </div>
    );
  }

  // Dynamic Theme Colors
  const isDark = theme === 'dark';
  const cBg = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cSidebar = isDark ? 'bg-slate-900/40 border-slate-900' : 'bg-white border-slate-200/80';
  const cCard = isDark ? 'bg-slate-900/20 border-slate-900' : 'bg-white border-slate-200/60 shadow-xl shadow-slate-200/40';
  const cTextMuted = isDark ? 'text-slate-500' : 'text-slate-400';
  const cTextHeading = isDark ? 'text-white' : 'text-slate-800';
  const cInput = isDark ? 'bg-slate-950/60 border-slate-900 text-slate-100 placeholder-slate-600 focus:border-teal-500/80' : 'bg-slate-100/80 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-600';
  const cTaskHover = isDark ? 'hover:bg-slate-900/10' : 'hover:bg-slate-50/60';
  const cBorder = isDark ? 'border-slate-900' : 'border-slate-200/80';
  const cBadge = isDark ? 'bg-slate-950 border-slate-900 text-slate-400' : 'bg-slate-100 border-slate-200/60 text-slate-600';

  return (
    <div className={`min-h-screen ${cBg} flex font-sans overflow-x-hidden relative transition-colors duration-300`}>
      
      {/* SaaS Premium Ambient Mesh Backgrounds (Only in dark mode for premium look) */}
      {isDark && (
        <>
          <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-teal-600/10 to-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-teal-600/5 to-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Floating Toast Notification Wrapper */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 animate-slide-up ${
              t.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                : t.type === 'info'
                ? 'bg-teal-500/10 border-teal-500/20 text-teal-500'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold tracking-wide">{t.message}</span>
          </div>
        ))}
      </div>

      {/* 1. Left Sidebar Navigation */}
      <aside className={`hidden lg:flex w-72 border-r ${cSidebar} backdrop-blur-xl flex-col p-6 space-y-8 z-20 flex-shrink-0 transition-colors duration-300`}>
        {/* Workspace Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-xl shadow-teal-500/25 border border-teal-400/20">
            A
          </div>
          <div>
            <h1 className={`text-lg font-bold tracking-tight ${isDark ? 'bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent' : 'text-slate-800'}`}>AeroTask</h1>
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold">Creative Workspace</p>
          </div>
        </div>

        {/* Workspace Selector Dropdown */}
        <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-900/40 border-slate-900/60 hover:border-slate-800/80' : 'bg-slate-100/50 border-slate-200/80 hover:bg-slate-100'} flex items-center justify-between cursor-pointer transition duration-200`}>
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[10px] text-teal-500 font-bold">W</div>
            <span className="text-xs font-semibold">My Tasks Board</span>
          </div>
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4 4 4-4" />
          </svg>
        </div>

        {/* Navigation Categories / Filtering Tabs */}
        <nav className="flex-1 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 block mb-3">Folders</span>
          
          <button
            onClick={() => setFilterTab('all')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition duration-200 font-medium text-xs ${
              filterTab === 'all'
                ? `${isDark ? 'bg-slate-900 text-white' : 'bg-teal-50 text-teal-700'} border ${isDark ? 'border-slate-800/60' : 'border-teal-200/30'}`
                : 'text-slate-400 hover:text-slate-500 hover:bg-slate-100/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>Inbox</span>
            </div>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${cBadge}`}>{totalCount}</span>
          </button>

          <button
            onClick={() => setFilterTab('pending')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition duration-200 font-medium text-xs ${
              filterTab === 'pending'
                ? `${isDark ? 'bg-slate-900 text-white' : 'bg-amber-50/50 text-amber-700'} border ${isDark ? 'border-slate-800/60' : 'border-amber-200/30'}`
                : 'text-slate-400 hover:text-slate-500 hover:bg-slate-100/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-amber-500/85" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Active Tasks</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-[10px] font-extrabold text-amber-600">{pendingCount}</span>
          </button>

          <button
            onClick={() => setFilterTab('completed')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition duration-200 font-medium text-xs ${
              filterTab === 'completed'
                ? `${isDark ? 'bg-slate-900 text-white' : 'bg-emerald-50/50 text-emerald-700'} border ${isDark ? 'border-slate-800/60' : 'border-emerald-200/30'}`
                : 'text-slate-400 hover:text-slate-500 hover:bg-slate-100/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-emerald-500/85" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Completed</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-[10px] font-extrabold text-emerald-600">{completedCount}</span>
          </button>
        </nav>

        {/* User Account Controls */}
        {user && (
          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-900/80 space-y-4">
            <div className="flex items-center gap-3 px-1">
              <div className="h-9 w-9 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center font-bold text-xs text-teal-500 shadow-md">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{user.username}</p>
                <p className={`text-[10px] ${cTextMuted} truncate`}>{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-900 hover:border-rose-500/20 hover:text-rose-500 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-rose-500/5 transition duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* 2. Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        
        {/* Header / Top Nav */}
        <header className={`border-b ${cBorder} backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 py-4 transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="lg:hidden h-8 w-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg border border-teal-400/20">A</div>
            <span className="text-sm font-bold tracking-tight uppercase lg:hidden">AeroTask</span>
            <span className={`hidden lg:inline text-xs font-semibold ${cTextMuted} tracking-wider`}>Workspace / Private To-Do Board</span>
          </div>

          <div className="flex items-center gap-4">
            {/* 🌗 Light/Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border ${isDark ? 'border-slate-800 hover:bg-slate-900 text-amber-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'} transition-all duration-200`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                // Sun Icon
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                // Moon Icon
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Mobile Account Details */}
            {user && (
              <div className="flex items-center gap-3 lg:hidden">
                <span className="text-xs font-semibold">{user.username}</span>
                <button
                  onClick={logout}
                  className={`px-3 py-1.5 text-[10px] font-bold ${cBadge} rounded-lg hover:text-rose-500 transition`}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 max-w-4xl w-full mx-auto space-y-8">
          
          {/* Header Title Board */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${cTextHeading} flex items-center gap-3`}>
                Inbox Workspace
                <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-[10px] font-extrabold text-teal-500 tracking-wider uppercase">Private</span>
              </h2>
              <p className={`text-sm ${cTextMuted} mt-1`}>Manage, search, and securely execute your tasks in real-time.</p>
            </div>

            {/* Circular Progress & Metrics Card */}
            <div className={`border ${cCard} rounded-2xl p-4 flex items-center gap-4 flex-shrink-0 backdrop-blur-md transition-colors duration-300`}>
              <div className="relative h-12 w-12 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="21" className={isDark ? "stroke-slate-800" : "stroke-slate-100"} strokeWidth="3" fill="transparent" />
                  <circle
                    cx="24"
                    cy="24"
                    r="21"
                    className="stroke-teal-500 transition-all duration-500"
                    strokeWidth="3.5"
                    fill="transparent"
                    strokeDasharray="132"
                    strokeDashoffset={132 - (132 * completionPercentage) / 100}
                  />
                </svg>
                <span className={`text-xs font-extrabold ${cTextHeading}`}>{completionPercentage}%</span>
              </div>
              <div>
                <p className="text-[9px] uppercase font-extrabold text-slate-500 tracking-wider">Completion</p>
                <p className="text-xs font-bold mt-0.5">{completedCount} of {totalCount} completed</p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid (Mobile View) */}
          <section className="grid grid-cols-3 gap-3 sm:gap-4 lg:hidden">
            <div className={`border ${cCard} rounded-xl p-3 sm:p-4 space-y-0.5`}>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Total</span>
              <p className="text-xl font-extrabold">{totalCount}</p>
            </div>
            <div className={`border ${cCard} rounded-xl p-3 sm:p-4 space-y-0.5`}>
              <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-wide block">Active</span>
              <p className="text-xl font-extrabold text-amber-500">{pendingCount}</p>
            </div>
            <div className={`border ${cCard} rounded-xl p-3 sm:p-4 space-y-0.5`}>
              <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-wide block">Done</span>
              <p className="text-xl font-extrabold text-emerald-500">{completedCount}</p>
            </div>
          </section>

          {/* Search Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className={`w-full pl-11 pr-4 py-3 rounded-xl border ${cInput} transition duration-200 text-sm backdrop-blur-md`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Mobile Filters */}
            <div className={`flex gap-1.5 lg:hidden p-1 rounded-xl border ${cCard}`}>
              <button
                onClick={() => setFilterTab('all')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition duration-150 ${
                  filterTab === 'all' ? (isDark ? 'bg-slate-900 text-white' : 'bg-teal-50 text-teal-700') : 'text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterTab('pending')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition duration-150 ${
                  filterTab === 'pending' ? (isDark ? 'bg-slate-900 text-white' : 'bg-amber-50 text-amber-700') : 'text-slate-400'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterTab('completed')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition duration-150 ${
                  filterTab === 'completed' ? (isDark ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-700') : 'text-slate-400'
                }`}
              >
                Done
              </button>
            </div>
          </div>

          {/* Master To-Do Board Card */}
          <section className={`border ${cCard} rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl transition-colors duration-300`}>
            
            {/* Create Task Form */}
            <form onSubmit={handleCreateTodo} className="flex gap-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a new task to Inbox..."
                className={`flex-1 px-4 py-3.5 rounded-2xl border ${cInput} transition duration-200 text-sm`}
              />
              <button
                type="submit"
                disabled={!title.trim() || actionLoading === 'create'}
                className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/10 flex items-center gap-2 flex-shrink-0"
              >
                {actionLoading === 'create' ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
                Add Task
              </button>
            </form>

            {/* Task list container */}
            <div className="space-y-6">
              
              {loading && todos.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <svg className="animate-spin h-8 w-8 text-teal-500 mx-auto" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-xs text-slate-500 font-semibold tracking-wider">Syncing secure workspace...</p>
                </div>
              ) : filteredTodos.length === 0 ? (
                <div className={`py-16 text-center border border-dashed ${isDark ? 'border-slate-800 bg-slate-950/20' : 'border-slate-200 bg-slate-50/40'} rounded-2xl space-y-4`}>
                  <div className={`mx-auto h-12 w-12 rounded-2xl ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100 border-slate-200'} flex items-center justify-center text-slate-400`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">No tasks match criteria</h3>
                    <p className={`text-xs ${cTextMuted} max-w-xs mx-auto`}>Create a task above or adjust your search queries/filter tabs.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* A. Active Tasks Section */}
                  {activeTodos.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className={`text-xs font-bold uppercase tracking-wider ${cTextMuted} px-2`}>Active Tasks</h3>
                      <div className={`divide-y ${isDark ? 'divide-slate-900/60' : 'divide-slate-100'} border ${cBorder} rounded-2xl overflow-hidden bg-slate-950/5`}>
                        {activeTodos.map((todo) => {
                          const isActionLoading = actionLoading === todo.documentId;
                          return (
                            <div
                              key={todo.documentId}
                              className={`flex items-center justify-between p-4 group transition-all duration-200 ${cTaskHover}`}
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                {/* Springy Checkbox */}
                                <button
                                  onClick={() => handleToggleStatus(todo)}
                                  disabled={isActionLoading}
                                  className="w-5.5 h-5.5 rounded-lg border border-slate-300 dark:border-slate-800 text-transparent hover:border-teal-500 hover:bg-teal-500/5 flex items-center justify-center flex-shrink-0 transition-all duration-300 transform active:scale-90"
                                >
                                  <svg className="w-3.5 h-3.5 stroke-[3.5]" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </button>

                                {/* Task Text */}
                                <div className="flex-1 min-w-0 space-y-0.5">
                                  <span
                                    onClick={() => handleToggleStatus(todo)}
                                    className={`text-sm select-none cursor-pointer block truncate font-medium ${isDark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
                                  >
                                    {todo.title}
                                  </span>
                                  
                                  <div className="flex items-center gap-2 text-[10px]">
                                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/5 text-amber-500 font-extrabold border border-amber-500/10">Active</span>
                                    <span className={cTextMuted}>
                                      {new Date(todo.createdAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                {isActionLoading && (
                                  <svg className="animate-spin h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                )}
                                <button
                                  onClick={() => handleDeleteTodo(todo)}
                                  disabled={isActionLoading}
                                  className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* B. Completed Tasks Section */}
                  {completedTodos.length > 0 && (
                    <div className="space-y-2.5">
                      <button
                        onClick={() => setShowCompletedList(!showCompletedList)}
                        className={`w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider ${cTextMuted} px-2 hover:text-teal-500 transition`}
                      >
                        <span className="flex items-center gap-2">
                          Completed Tasks ({completedTodos.length})
                        </span>
                        <svg className={`w-4 h-4 transform transition-transform duration-200 ${showCompletedList ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showCompletedList && (
                        <div className={`divide-y ${isDark ? 'divide-slate-900/60' : 'divide-slate-100'} border ${cBorder} rounded-2xl overflow-hidden bg-slate-950/5 animate-fade-in`}>
                          {completedTodos.map((todo) => {
                            const isActionLoading = actionLoading === todo.documentId;
                            return (
                              <div
                                key={todo.documentId}
                                className={`flex items-center justify-between p-4 group transition-all duration-200 bg-slate-100/5 dark:bg-slate-900/5 ${cTaskHover}`}
                              >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  {/* Checked Checkbox */}
                                  <button
                                    onClick={() => handleToggleStatus(todo)}
                                    disabled={isActionLoading}
                                    className="w-5.5 h-5.5 rounded-lg bg-emerald-500/10 border border-emerald-500 text-emerald-500 hover:bg-emerald-500/20 flex items-center justify-center flex-shrink-0 transition-all duration-300 transform active:scale-90"
                                  >
                                    <svg className="w-3.5 h-3.5 stroke-[3.5]" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>

                                  {/* Task Text (Strikethrough) */}
                                  <div className="flex-1 min-w-0 space-y-0.5">
                                    <span
                                      onClick={() => handleToggleStatus(todo)}
                                      className="text-sm select-none cursor-pointer block truncate text-slate-400 line-through decoration-slate-400/80 decoration-1.5"
                                    >
                                      {todo.title}
                                    </span>
                                    
                                    <div className="flex items-center gap-2 text-[10px]">
                                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/5 text-emerald-600 font-extrabold border border-emerald-500/10">Done</span>
                                      <span className={cTextMuted}>
                                        {new Date(todo.createdAt).toLocaleDateString(undefined, {
                                          month: 'short',
                                          day: 'numeric',
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                  {isActionLoading && (
                                    <svg className="animate-spin h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                  )}
                                  <button
                                    onClick={() => handleDeleteTodo(todo)}
                                    disabled={isActionLoading}
                                    className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                  >
                                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className={`border-t ${cBorder} py-6 text-center text-[10px] uppercase tracking-wider ${cTextMuted} bg-slate-950/20 mt-auto`}>
          <p>© 2026 AeroTask Private Board. Secured by context token guard permissions.</p>
        </footer>
      </div>
    </div>
  );
}
