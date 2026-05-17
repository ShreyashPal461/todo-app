'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function SignUp() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Front-end validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const res = await register(username, email, password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to create an account.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Premium Minimal Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Card Wrapper */}
      <div className="relative w-full max-w-sm z-10">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl shadow-sm p-7 space-y-6 transition-all duration-300">
          
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-sm border border-slate-800 dark:border-slate-200 mb-2">
              A
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              Create Account
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Join AeroTask to safely organize your daily tasks
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="username" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourusername"
                className="w-full px-3 py-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 transition duration-150 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 transition duration-150 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 transition duration-150 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-2.5 px-3 font-bold text-xs rounded-lg text-white dark:text-slate-950 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 active:scale-[0.99] focus:outline-none transition duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="animate-spin h-3.5 w-3.5 text-current" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-1 border-t border-slate-100 dark:border-slate-900">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Already have an account?{' '}
              <Link href="/signin" className="font-semibold text-slate-700 dark:text-slate-300 hover:underline">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
