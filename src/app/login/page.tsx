'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Film, User, Lock, Mail, Phone, ArrowRight, ShieldCheck, Sparkles, Key } from 'lucide-react';
import { useShortFilm } from '@/context/ShortFilmContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const { loginWithCredentials, signUpWithCredentials, activePersona, isLoaded } = useShortFilm();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in (excluding default Cinephile Viewer guest)
  useEffect(() => {
    if (isLoaded && activePersona && activePersona.email) {
      if (activePersona.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectPath);
      }
    }
  }, [activePersona, isLoaded, router, redirectPath]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await loginWithCredentials(loginEmail, loginPassword);
      setIsSubmitting(false);

      if (res.success) {
        setSuccessMsg('Successfully logged in! Redirecting...');
        // Wait briefly for smooth transition
        setTimeout(() => {
          if (loginEmail === 'admin@streamix.com' || loginEmail.includes('admin')) {
            router.push('/admin');
          } else {
            router.push(redirectPath);
          }
        }, 1000);
      } else {
        setErrorMsg(res.error || 'Invalid credentials.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('An unexpected error occurred. Please try again.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await signUpWithCredentials(signupName, signupEmail, signupPhone, signupPassword);
      setIsSubmitting(false);

      if (res.success) {
        setSuccessMsg('Account registered successfully! Redirecting...');
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      } else {
        setErrorMsg(res.error || 'Failed to register account.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0C10] flex items-center justify-center p-4">
      <div className="card-flat p-6 sm:p-8 max-w-md w-full border border-[#FFD60A]/40 shadow-[0_0_30px_rgba(255,214,10,0.1)] space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#FFD60A] text-[#0B0C10] flex items-center justify-center font-black mx-auto shadow-lg hover:scale-105 transition-transform duration-300">
            <Film className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-black text-[#F5F5F5] tracking-tight">
            CINE<span className="text-[#FFD60A]">SHORT</span> AUTH
          </h1>
          <p className="text-xs text-gray-400">
            Secure entry point for users, directors, and administrators.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-800 text-xs">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 pb-3 font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'login'
                ? 'border-b-2 border-[#FFD60A] text-[#FFD60A]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 pb-3 font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'signup'
                ? 'border-b-2 border-[#FFD60A] text-[#FFD60A]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="bg-[#E63946]/15 border border-[#E63946]/50 text-[#E63946] text-xs p-3 rounded-lg font-semibold animate-pulse">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-500/15 border border-emerald-500/50 text-emerald-400 text-xs p-3 rounded-lg font-semibold">
            {successMsg}
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="flex items-center bg-[#0B0C10] border border-gray-700 rounded-lg px-3 py-2.5 focus-within:border-[#FFD60A] transition-all">
                <Mail className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-transparent text-[#F5F5F5] w-full focus:outline-none placeholder-gray-500"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="flex items-center bg-[#0B0C10] border border-gray-700 rounded-lg px-3 py-2.5 focus-within:border-[#FFD60A] transition-all">
                <Lock className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-transparent text-[#F5F5F5] w-full focus:outline-none placeholder-gray-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold w-full text-xs py-3 font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150"
            >
              <Key className="w-4 h-4 text-[#0B0C10]" />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="flex items-center bg-[#0B0C10] border border-gray-700 rounded-lg px-3 py-2.5 focus-within:border-[#FFD60A] transition-all">
                <User className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="bg-transparent text-[#F5F5F5] w-full focus:outline-none placeholder-gray-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="flex items-center bg-[#0B0C10] border border-gray-700 rounded-lg px-3 py-2.5 focus-within:border-[#FFD60A] transition-all">
                <Mail className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="bg-transparent text-[#F5F5F5] w-full focus:outline-none placeholder-gray-500"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="flex items-center bg-[#0B0C10] border border-gray-700 rounded-lg px-3 py-2.5 focus-within:border-[#FFD60A] transition-all">
                <Phone className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="tel"
                  required
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  className="bg-transparent text-[#F5F5F5] w-full focus:outline-none placeholder-gray-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="flex items-center bg-[#0B0C10] border border-gray-700 rounded-lg px-3 py-2.5 focus-within:border-[#FFD60A] transition-all">
                <Lock className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="bg-transparent text-[#F5F5F5] w-full focus:outline-none placeholder-gray-500"
                  placeholder="Minimum 6 characters"
                  minLength={6}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Passwords are stored in plain-text as requested.</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold w-full text-xs py-3 font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150"
            >
              <ArrowRight className="w-4 h-4 text-[#0B0C10]" />
              <span>{isSubmitting ? 'Registering...' : 'Sign Up'}</span>
            </button>
          </form>
        )}

        {/* Demo shortcuts & help */}
        <div className="pt-4 border-t border-gray-700/50 text-center space-y-2">
          <div className="text-[11px] text-gray-400 flex flex-col gap-1 justify-center items-center">
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-[#FFD60A]" /> Demo Credentials:</span>
            <div className="bg-[#1F2833] px-2 py-1.5 rounded-lg border border-gray-700 text-left w-full space-y-1 font-mono text-[10px]">
              <div><strong className="text-[#FFD60A]">Admin:</strong> admin@streamix.com / admin123</div>
              <div><strong className="text-[#FFD60A]">User:</strong> user@streamix.com / user123</div>
            </div>
          </div>
          <Link href="/" className="text-xs text-gray-400 hover:text-[#FFD60A] block pt-2">
            ← Return to Feed
          </Link>
        </div>
      </div>
    </div>
  );
}
