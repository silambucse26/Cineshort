'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Star, Film, Users, Crown, Sparkles, ChevronRight } from 'lucide-react';
import { useShortFilm } from '../../context/ShortFilmContext';

export default function LeaderboardPage() {
  const router = useRouter();
  const { directors, films, activePersona, isLoaded } = useShortFilm();

  // Guard for admin only
  useEffect(() => {
    if (isLoaded) {
      if (!activePersona || activePersona.role !== 'admin') {
        router.replace('/login?redirect=/leaderboard');
      }
    }
  }, [isLoaded, activePersona, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
        <div className="text-xs text-gray-400 font-bold animate-pulse">Loading auth session...</div>
      </div>
    );
  }

  if (!activePersona || activePersona.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-center p-4">
        <div className="card-flat p-6 border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-wider">
          Access Denied. Administrator privilege required to view the leaderboard.
        </div>
      </div>
    );
  }

  // Rank directors dynamically by avg_rating (descending), then film_count (descending)
  const rankedDirectors = [...directors].sort((a, b) => {
    if (b.avg_rating !== a.avg_rating) {
      return b.avg_rating - a.avg_rating;
    }
    return b.film_count - a.film_count;
  });

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Leaderboard Header */}
        <div className="card-flat p-6 sm:p-8 relative overflow-hidden border border-[#F4A300]/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-[#F4A300]/15 text-[#F4A300] border border-[#F4A300]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5" /> Monthly Hall of Fame
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#F5F5F5] tracking-tight">
                Top Director Rankings
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 max-w-lg">
                Ranked by real-time viewer and celebrity ratings. Rated short films directly determine monthly leaderboard positions!
              </p>
            </div>

            <div className="bg-[#0B0C10] p-4 rounded-xl border border-gray-800 flex items-center gap-3 shrink-0">
              <Crown className="w-10 h-10 text-[#FFD60A]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Current #1 Leader</span>
                <p className="text-sm font-black text-[#FFD60A]">{rankedDirectors[0]?.name}</p>
                <span className="text-xs text-[#F4A300] font-bold">{rankedDirectors[0]?.avg_rating.toFixed(1)} ★</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table / Cards */}
        <div className="space-y-3">
          {rankedDirectors.map((director, index) => {
            const rank = index + 1;
            const directorTopFilm = films.find((f) => f.director_id === director.id);

            // Custom Rank Badge Colors
            let rankBadgeClass = 'bg-[#1F2833] text-gray-300 border-gray-700';
            if (rank === 1) rankBadgeClass = 'bg-[#FFD60A] text-[#0B0C10] font-black border-[#FFD60A] shadow-lg scale-105';
            if (rank === 2) rankBadgeClass = 'bg-[#E0E0E0] text-[#0B0C10] font-bold border-gray-300';
            if (rank === 3) rankBadgeClass = 'bg-[#CD7F32] text-white font-bold border-[#CD7F32]';

            return (
              <div
                key={director.id}
                className={`card-flat p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-[#F4A300]/50 transition-all ${
                  rank === 1 ? 'border-[#FFD60A]/40 bg-[#1F2833]/90' : ''
                }`}
              >
                {/* Left Rank & Director Profile */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* Rank Badge */}
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center text-base sm:text-lg shrink-0 ${rankBadgeClass}`}
                  >
                    {rank === 1 ? <Crown className="w-6 h-6 fill-current" /> : `#${rank}`}
                  </div>

                  {/* Profile Pic */}
                  <Link href={`/director/${director.id}`} className="shrink-0">
                    <img
                      src={director.profile_pic_url}
                      alt={director.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#F4A300]"
                    />
                  </Link>

                  {/* Director Info */}
                  <div className="min-w-0 flex-grow">
                    <Link
                      href={`/director/${director.id}`}
                      className="font-bold text-base text-[#F5F5F5] hover:text-[#FFD60A] transition-colors flex items-center gap-2 truncate"
                    >
                      <span className="truncate">{director.name}</span>
                    </Link>
                    <p className="text-xs text-gray-400 truncate max-w-xs sm:max-w-sm">
                      {director.bio}
                    </p>
                  </div>
                </div>

                {/* Right Stats & Top Film */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-700/50">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <span className="text-[10px] uppercase text-gray-400 font-semibold block">Avg Rating</span>
                      <span className="text-sm font-black text-[#F4A300] flex items-center justify-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-current text-[#F4A300]" />
                        {director.avg_rating.toFixed(1)}
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] uppercase text-gray-400 font-semibold block">Shorts</span>
                      <span className="text-sm font-black text-[#F5F5F5] flex items-center justify-center gap-1">
                        <Film className="w-3.5 h-3.5 text-gray-400" />
                        {director.film_count}
                      </span>
                    </div>
                  </div>

                  {/* Link to Director Profile */}
                  <Link
                    href={`/director/${director.id}`}
                    className="bg-[#0B0C10] hover:bg-[#0B0C10]/80 p-2.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-[#FFD60A] transition-colors shrink-0"
                    title="View Director Profile"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
