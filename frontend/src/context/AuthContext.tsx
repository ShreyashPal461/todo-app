'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to set cookie client-side
const setCookie = (name: string, value: string, days = 30) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
};

// Helper to delete cookie client-side
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax; Secure`;
};

// Helper to get cookie client-side
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Hydrate authentication state on load
    const storedToken = getCookie('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedToken !== 'undefined' && storedToken !== 'null' && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Clear corrupt data
        localStorage.removeItem('user');
        deleteCookie('token');
      }
    } else {
      // Clear asymmetric or missing session data
      localStorage.removeItem('user');
      deleteCookie('token');
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:1337/api/auth/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Invalid username or password');
      }

      const { jwt, user: userData } = data;
      const cleanUser: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
      };

      // Set cookie for middleware route protection
      setCookie('token', jwt, 30);
      localStorage.setItem('user', JSON.stringify(cleanUser));

      setToken(jwt);
      setUser(cleanUser);
      setLoading(false);

      router.push('/');
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'An error occurred during sign in.' };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:1337/api/auth/local/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to register account');
      }

      const { jwt, user: userData } = data;
      const cleanUser: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
      };

      // Set cookie and localStorage
      setCookie('token', jwt, 30);
      localStorage.setItem('user', JSON.stringify(cleanUser));

      setToken(jwt);
      setUser(cleanUser);
      setLoading(false);

      router.push('/');
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'An error occurred during registration.' };
    }
  };

  const logout = () => {
    deleteCookie('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/signin');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
