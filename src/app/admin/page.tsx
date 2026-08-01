'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Film, 
  Users, 
  FileCheck2, 
  Star, 
  Upload, 
  MessageSquareWarning, 
  ArrowRight, 
  Clock, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { useShortFilm } from '@/context/ShortFilmContext';

export default function AdminDashboardPage() {
  const { films, approvedFilms, pendingFilms, directors, heroes, comments } = useShortFilm();

  // Stats calculation
  const totalFilms = films.length;
  const totalApproved = approvedFilms.length;
  const totalPending = pendingFilms.length;
  const totalDirectors = directors.length;
  const totalHeroes = heroes.length;
  const flaggedComments = comments.filter((c) => c.is_flagged);
  const totalRatingsWeek = films.reduce((acc, f) => acc + f.rating_count, 0) + 45;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="card-flat p-6 sm:p-8 border border-[#F4A300]/40 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 bg-[#F4A300]/15 text-[#F4A300] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Platform Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F5]">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Overview of short films, pending review queue, director profiles, and content moderation.
          </p>
        </div>

        {totalPending > 0 && (
          <Link
            href="/admin/review"
            className="bg-[#E63946] hover:bg-[#E63946]/90 text-white font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg shrink-0 animate-bounce"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{totalPending} Film{totalPending > 1 ? 's' : ''} Pending Review</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Approved Films */}
        <div className="card-flat p-5 space-y-2 border-l-4 border-l-[#FFD60A]">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
            <span>Approved Short Films</span>
            <Film className="w-4 h-4 text-[#FFD60A]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F5F5F5]">{totalApproved}</div>
          <p className="text-[11px] text-gray-400">Total live films on public feed ({totalFilms} overall)</p>
        </div>

        {/* Card 2: Total Directors */}
        <div className="card-flat p-5 space-y-2 border-l-4 border-l-[#F4A300]">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
            <span>Registered Directors</span>
            <Users className="w-4 h-4 text-[#F4A300]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F4A300]">{totalDirectors}</div>
          <p className="text-[11px] text-gray-400">{totalHeroes} verified heroes & cast members</p>
        </div>

        {/* Card 3: Pending Review Queue */}
        <div className="card-flat p-5 space-y-2 border-l-4 border-l-[#E63946]">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
            <span>Films Pending Review</span>
            <FileCheck2 className="w-4 h-4 text-[#E63946]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#E63946]">{totalPending}</div>
          <p className="text-[11px] text-gray-400">Awaiting admin review & approval</p>
        </div>

        {/* Card 4: Weekly Ratings */}
        <div className="card-flat p-5 space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
            <span>Total Ratings This Week</span>
            <Star className="w-4 h-4 text-[#F4A300] fill-current" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F5F5F5]">{totalRatingsWeek}</div>
          <p className="text-[11px] text-emerald-400 font-medium">↑ +18.4% engagement rate</p>
        </div>
      </div>

      {/* Quick Action Navigation Buttons Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#F5F5F5]">Admin Management Modules</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/review"
            className="card-flat p-5 hover:border-[#F4A300] transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#E63946]/20 text-[#E63946] flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#F5F5F5] group-hover:text-[#FFD60A] transition-colors">
                Review Queue
              </h3>
              <p className="text-xs text-gray-400">
                Approve or reject uploaded films submitted by directors.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-[#F4A300]">
              <span>{totalPending} pending</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/upload"
            className="card-flat p-5 hover:border-[#FFD60A] transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#FFD60A]/20 text-[#FFD60A] flex items-center justify-center font-bold">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#F5F5F5] group-hover:text-[#FFD60A] transition-colors">
                Upload Movie
              </h3>
              <p className="text-xs text-gray-400">
                Add short films directly to Google Drive and Supabase.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-[#FFD60A]">
              <span>New Upload</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/manage"
            className="card-flat p-5 hover:border-[#F4A300] transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#F4A300]/20 text-[#F4A300] flex items-center justify-center font-bold">
                <Film className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#F5F5F5] group-hover:text-[#FFD60A] transition-colors">
                Manage Content
              </h3>
              <p className="text-xs text-gray-400">
                Edit film metadata, manage directors, heroes, and status.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-[#F4A300]">
              <span>{totalFilms} films</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/moderation"
            className="card-flat p-5 hover:border-[#E63946] transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <MessageSquareWarning className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#F5F5F5] group-hover:text-[#FFD60A] transition-colors">
                Moderation
              </h3>
              <p className="text-xs text-gray-400">
                Review viewer feedback and remove flagged/spam comments.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-purple-400">
              <span>{flaggedComments.length} flagged</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
