import React from 'react';
import { Todo } from '../../types/todo';
import { Checkbox } from '../ui/Checkbox';

interface TodoItemProps {
  todo: Todo;
  onToggleStatus: (todo: Todo) => void;
  onDeleteTodo: (todo: Todo) => void;
  actionLoading: boolean;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleStatus,
  onDeleteTodo,
  actionLoading,
}) => {
  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'low':
        return 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800';
      case 'medium':
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
  };

  const formattedDate = new Date(todo.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex items-center justify-between p-3.5 group bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/20 border border-slate-100 dark:border-slate-900/60 rounded-xl transition duration-150">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Custom Tick Animation Checkbox */}
        <Checkbox
          checked={todo.isCompleted}
          onChange={() => onToggleStatus(todo)}
          disabled={actionLoading}
        />

        {/* Task Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <span
            onClick={() => !actionLoading && onToggleStatus(todo)}
            className={`text-xs font-semibold select-none cursor-pointer block truncate ${
              todo.isCompleted
                ? 'text-slate-400 dark:text-slate-600 line-through decoration-slate-300 dark:decoration-slate-800'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {todo.title}
          </span>

          <div className="flex flex-wrap items-center gap-2 text-[9px]">
            {/* Priority Tag */}
            <span className={`px-1.5 py-0.5 rounded-md border font-extrabold uppercase tracking-wider ${getPriorityStyle(todo.priority)}`}>
              {todo.priority || 'medium'}
            </span>

            {/* Folder Category Tag */}
            {todo.category && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
                {todo.category}
              </span>
            )}

            {/* Calendar Created Date */}
            <span className="text-slate-400 dark:text-slate-600 font-medium">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {actionLoading ? (
          <svg className="animate-spin h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <button
            onClick={() => onDeleteTodo(todo)}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/10 rounded-lg transition opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Delete Permanently"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
