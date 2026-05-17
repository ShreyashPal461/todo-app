import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, disabled }) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange();
      }}
      disabled={disabled}
      className={`group relative flex h-5 w-5 items-center justify-center rounded-md border text-white transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
        checked
          ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/20'
          : 'border-slate-300 dark:border-slate-800 bg-transparent hover:border-slate-400 dark:hover:border-slate-700'
      }`}
    >
      <svg
        className={`h-3 w-3 transition-transform duration-300 stroke-[3.5] ${
          checked ? 'scale-100' : 'scale-0'
        }`}
        viewBox="0 0 12 10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M1 5l3.5 3.5L11 1"
          style={{
            strokeDasharray: 15,
            strokeDashoffset: checked ? 0 : 15,
            transition: checked ? 'stroke-dashoffset 0.25s ease-out 0.05s' : 'none',
          }}
        />
      </svg>
    </button>
  );
};
