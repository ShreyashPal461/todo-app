import React, { useState } from 'react';
import { Todo } from '../../types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  title: string;
  onToggleStatus: (todo: Todo) => void;
  onDeleteTodo: (todo: Todo) => void;
  actionLoading: string | null;
  isCompletedList?: boolean;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  title,
  onToggleStatus,
  onDeleteTodo,
  actionLoading,
  isCompletedList = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (todos.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {/* Toggle header for completed, simple label for active */}
      {isCompletedList ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 hover:text-slate-600 dark:hover:text-slate-300 transition"
        >
          <span className="flex items-center gap-1.5">
            {title} ({todos.length})
          </span>
          <svg
            className={`w-3.5 h-3.5 transform transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
          {title}
        </h3>
      )}

      {isOpen && (
        <div className="space-y-2 animate-fade-in">
          {todos.map((todo) => (
            <TodoItem
              key={todo.documentId}
              todo={todo}
              onToggleStatus={onToggleStatus}
              onDeleteTodo={onDeleteTodo}
              actionLoading={actionLoading === todo.documentId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
