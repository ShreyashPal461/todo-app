'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Todo, Toast as ToastType } from '../types/todo';
import { todoApi } from '../lib/api';

// Components
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { TodoForm } from '../components/todo/TodoForm';
import { TodoList } from '../components/todo/TodoList';
import { Toast } from '../components/ui/Toast';

export default function Dashboard() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  
  // Theme State: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('app-theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }, []);

  // Sync theme with DOM root class for class-based dark styling
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('app-theme', nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'info');
  };

  // Toast Notification triggers
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Client-Side Auth Guard: redirect to sign-in if not loading and no token exists
  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/signin');
    }
  }, [authLoading, token, router]);

  // Fetch todos from Strapi backend
  const fetchTodos = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await todoApi.getTodos(token);
      setTodos(data);
    } catch (err: any) {
      const errMsg = err.message || '';
      showToast(errMsg || 'Could not connect to backend server.', 'error');
      
      // Auto-heal session on 401 or 403 authorization failures
      if (errMsg.includes('401') || errMsg.includes('403') || errMsg.toLowerCase().includes('forbidden') || errMsg.toLowerCase().includes('unauthorized')) {
        setTimeout(() => {
          logout();
        }, 1500); // Give user enough time to see the toast warning
      }
    } finally {
      setLoading(false);
    }
  }, [token, showToast, logout]);

  useEffect(() => {
    if (token) {
      fetchTodos();
    }
  }, [token, fetchTodos]);

  // Create a new todo
  const handleCreateTodo = async (title: string, priority: 'low' | 'medium' | 'high', category: string) => {
    if (!token) return;
    try {
      setActionLoading('create');
      const newTodo = await todoApi.createTodo(token, title, priority, category);
      setTodos((prev) => [newTodo, ...prev]);
      showToast('Task added successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to create task.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle status (Optimistic UI)
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
      const updatedTodo = await todoApi.updateTodo(token, todo.documentId, {
        isCompleted: nextStatus,
      });

      setTodos((prev) =>
        prev.map((t) => (t.documentId === todo.documentId ? updatedTodo : t))
      );
      showToast(nextStatus ? 'Task completed!' : 'Task marked as active.');
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

  // Delete task (Optimistic UI)
  const handleDeleteTodo = async (todo: Todo) => {
    if (!token) return;

    const originalTodos = [...todos];
    setTodos((prev) => prev.filter((t) => t.documentId !== todo.documentId));

    try {
      setActionLoading(todo.documentId);
      await todoApi.deleteTodo(token, todo.documentId);
      showToast('Task deleted permanently.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task.', 'error');
      setTodos(originalTodos); // Rollback
    } finally {
      setActionLoading(null);
    }
  };

  // Filter tasks based on Search, Navigation Folder, and Tabs
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (todo.category && todo.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = activeCategory === 'all' || todo.category === activeCategory;
      
      if (!matchesSearch || !matchesCategory) return false;
      
      if (filterTab === 'all') return true;
      if (filterTab === 'pending') return !todo.isCompleted;
      if (filterTab === 'completed') return todo.isCompleted;
      return true;
    });
  }, [todos, searchQuery, filterTab, activeCategory]);

  const activeTodos = useMemo(() => filteredTodos.filter(t => !t.isCompleted), [filteredTodos]);
  const completedTodos = useMemo(() => filteredTodos.filter(t => t.isCompleted), [filteredTodos]);

  // Metrics (scoped to current category)
  const categoryTodos = useMemo(() => {
    return todos.filter(t => activeCategory === 'all' || t.category === activeCategory);
  }, [todos, activeCategory]);

  const totalCount = categoryTodos.length;
  const completedCount = categoryTodos.filter(t => t.isCompleted).length;
  const pendingCount = totalCount - completedCount;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Active workspace label display
  const activeCategoryName = activeCategory === 'all' ? 'Inbox' : activeCategory;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 text-slate-800 dark:text-white font-sans transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-slate-700 dark:text-slate-300" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 animate-pulse">
            Syncing Credentials...
          </span>
        </div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex font-sans overflow-x-hidden relative transition-colors duration-300">
      
      {/* Dynamic Toast Wrapper */}
      <Toast toasts={toasts} onClose={closeToast} />

      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        user={user}
        logout={logout}
        filterTab={filterTab}
        setFilterTab={setFilterTab}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        totalCount={totalCount}
        pendingCount={pendingCount}
        completedCount={completedCount}
        isDark={isDark}
      />

      {/* 2. Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Top Navbar */}
        <Header
          user={user}
          logout={logout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          toggleTheme={toggleTheme}
          isDark={isDark}
        />

        {/* Dashboard Scroll Container */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-8 max-w-3xl w-full mx-auto space-y-6">
          {/* Stats KPI Board */}
          <StatsOverview
            totalCount={totalCount}
            completedCount={completedCount}
            pendingCount={pendingCount}
            completionPercentage={completionPercentage}
            activeCategoryName={activeCategoryName}
          />

          {/* Quick Filters (Mobile Layout) */}
          <section className="flex lg:hidden p-1 rounded-xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterTab === 'all'
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white'
                  : 'text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterTab === 'pending'
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white'
                  : 'text-slate-400'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterTab === 'completed'
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white'
                  : 'text-slate-400'
              }`}
            >
              Done
            </button>
          </section>

          {/* Tasks Operations Section */}
          <div className="space-y-4">
            {/* Create Task Smart Form */}
            <TodoForm
              onCreateTodo={handleCreateTodo}
              actionLoading={actionLoading === 'create'}
              defaultCategory={activeCategory}
            />

            {/* Tasks Lists wrapper */}
            <div className="space-y-6">
              {loading && todos.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <svg className="animate-spin h-6 w-6 text-slate-400 mx-auto" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Syncing workspace...
                  </p>
                </div>
              ) : filteredTodos.length === 0 ? (
                /* High-fidelity empty state */
                <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950/20 rounded-xl space-y-3.5">
                  <div className="mx-auto h-10 w-10 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">No tasks in view</h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                      Add a new item above, adjust filters, or browse other categories.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Active Tasks list */}
                  <TodoList
                    todos={activeTodos}
                    title="Active Tasks"
                    onToggleStatus={handleToggleStatus}
                    onDeleteTodo={handleDeleteTodo}
                    actionLoading={actionLoading}
                  />

                  {/* Completed Tasks list */}
                  <TodoList
                    todos={completedTodos}
                    title="Completed Tasks"
                    onToggleStatus={handleToggleStatus}
                    onDeleteTodo={handleDeleteTodo}
                    actionLoading={actionLoading}
                    isCompletedList={true}
                  />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-slate-100 dark:border-slate-900/60 py-4 text-center text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-600 bg-white/40 dark:bg-slate-950/20 mt-auto">
          <p>© 2026 AeroTask Workspace. Secured by private session token tokens.</p>
        </footer>
      </div>
    </div>
  );
}
