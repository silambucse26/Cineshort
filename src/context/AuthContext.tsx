'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateAvatar: (avatarUrl: string) => void;
  isSupabaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isSupabaseActive = !!supabase;

  // Set up mock users
  const MOCK_USERS = [
    { email: 'admin@streamix.com', password: 'password123', username: 'StreamixAdmin', role: 'admin' as const, avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin' },
    { email: 'user@streamix.com', password: 'password123', username: 'CinematicFan', role: 'user' as const, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' }
  ];

  useEffect(() => {
    if (isSupabaseActive && supabase) {
      // 1. Supabase Auth Listener
      const getSession = async () => {
        const { data: { session } } = await supabase!.auth.getSession();
        if (session?.user) {
          // Determine role: default is user, check metadata
          const metaRole = session.user.user_metadata?.role || 'user';
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
            avatarUrl: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
            role: metaRole
          });
        }
        setLoading(false);
      };

      getSession();

      const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const metaRole = session.user.user_metadata?.role || 'user';
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
            avatarUrl: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
            role: metaRole
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // 2. Local Mock Auth Initialization
      const mockSession = localStorage.getItem('streamix_mock_session');
      if (mockSession) {
        try {
          setUser(JSON.parse(mockSession));
        } catch (e) {
          localStorage.removeItem('streamix_mock_session');
        }
      }
      setLoading(false);
    }
  }, [isSupabaseActive]);

  // Auth Operations
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true);
    if (isSupabaseActive && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoading(false);
        return { error: error.message };
      }
      return { error: null };
    } else {
      // Mock Sign In
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      if (foundUser) {
        const loggedUser: UserProfile = {
          id: `mock-${Date.now()}`,
          email: foundUser.email,
          username: foundUser.username,
          avatarUrl: foundUser.avatarUrl,
          role: foundUser.role
        };
        localStorage.setItem('streamix_mock_session', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setLoading(false);
        return { error: null };
      } else {
        setLoading(false);
        return { error: 'Invalid email or password.' };
      }
    }
  };

  const signUp = async (email: string, password: string, username: string): Promise<{ error: string | null }> => {
    setLoading(true);
    if (isSupabaseActive && supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            role: 'user',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
          }
        }
      });
      if (error) {
        setLoading(false);
        return { error: error.message };
      }
      return { error: null };
    } else {
      // Mock Sign Up
      if (email.trim() === '' || password.trim() === '' || username.trim() === '') {
        setLoading(false);
        return { error: 'All fields are required.' };
      }
      // Create user and log in immediately
      const loggedUser: UserProfile = {
        id: `mock-${Date.now()}`,
        email,
        username,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        role: 'user'
      };
      localStorage.setItem('streamix_mock_session', JSON.stringify(loggedUser));
      setUser(loggedUser);
      setLoading(false);
      return { error: null };
    }
  };

  const signOut = async () => {
    setLoading(true);
    if (isSupabaseActive && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('streamix_mock_session');
    }
    setUser(null);
    setLoading(false);
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    if (isSupabaseActive && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error: error ? error.message : null };
    } else {
      // Mock reset
      if (email.trim() === '') return { error: 'Email is required.' };
      return { error: null }; // pretend it succeeded
    }
  };

  const updateAvatar = (avatarUrl: string) => {
    if (!user) return;
    const updated = { ...user, avatarUrl };
    setUser(updated);
    if (!isSupabaseActive) {
      localStorage.setItem('streamix_mock_session', JSON.stringify(updated));
    } else if (supabase) {
      supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword, updateAvatar, isSupabaseActive }}>
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
