import React, { useState } from 'react';

interface TodoFormProps {
  onCreateTodo: (title: string, priority: 'low' | 'medium' | 'high', category: string) => Promise<void>;
  actionLoading: boolean;
  defaultCategory: string;
}

export const TodoForm: React.FC<TodoFormProps> = ({
  onCreateTodo,
  actionLoading,
  defaultCategory,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('Work');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || actionLoading) return;
    
    // Determine target category based on active tab
    const finalCategory = defaultCategory === 'all' ? category : defaultCategory;

    await onCreateTodo(title.trim(), priority, finalCategory);
    setTitle('');
    setPriority('medium');
  };

  const categories = ['Work', 'Personal', 'Ideas', 'Inbox'];

  return (
    <form onSubmit={handleSubmit} className="border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 rounded-xl p-4 space-y-3.5 transition-all duration-300">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 transition duration-150 text-xs"
        />
        <button
          type="submit"
          disabled={!title.trim() || actionLoading}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs transition duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {actionLoading ? (
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
          Create Task
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-900">
        <div className="flex gap-4">
          {/* Priority Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">Priority</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="bg-transparent text-xs text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer font-medium"
            >
              <option value="low" className="dark:bg-slate-950 text-slate-500">Low</option>
              <option value="medium" className="dark:bg-slate-950 text-amber-500">Medium</option>
              <option value="high" className="dark:bg-slate-950 text-rose-500">High</option>
            </select>
          </div>

          {/* Category Select (Only shown if workspace category filter is set to "all") */}
          {defaultCategory === 'all' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">Folder</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent text-xs text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Keyboard shortcut hint */}
        <div className="hidden sm:flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-600">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-900 font-sans font-bold">Enter</kbd>
          <span>to submit</span>
        </div>
      </div>
    </form>
  );
};
