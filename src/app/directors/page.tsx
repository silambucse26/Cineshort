'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Clapperboard, 
  Star, 
  Film, 
  Users, 
  Crown, 
  Sparkles, 
  ChevronRight, 
  Search,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { useShortFilm } from '../../context/ShortFilmContext';

export default function DirectorCollectionsPage() {
  const { directors, films, followedDirectorIds, toggleFollowDirector } = useShortFilm();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'films' | 'followers'>('rating');

  // Filter & Sort Directors
  const filteredDirectors = directors
    .filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.bio.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return b.avg_rating - a.avg_rating;
      if (sortBy === 'films') return b.film_count - a.film_count;
      if (sortBy === 'followers') return b.follower_count - a.follower_count;
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <div className="card-flat p-6 sm:p-10 border-2 border-[#FFD60A]/40 bg-gradient-to-r from-[#1F2833] via-[#0B0C10] to-[#1F2833] relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#FFD60A]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                <Clapperboard className="w-3.5 h-3.5" /> Official Director Collections
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#F5F5F5] uppercase tracking-tight">
                Director Movie Vaults
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
                Explore entire short film filmographies curated by top indie filmmakers. Discover exclusive collections, director bios, and rate their films!
              </p>
            </div>

            <div className="bg-[#0B0C10] p-5 rounded-2xl border border-gray-800 flex items-center gap-4 shrink-0 shadow-lg">
              <Crown className="w-10 h-10 text-[#FFD60A]" />
              <div>
                <span className="text-[10px] uppercase font-extrabold text-gray-400 block tracking-wider">Total Filmmakers</span>
                <p className="text-xl font-black text-[#FFD60A]">{directors.length} Directors</p>
                <span className="text-xs text-gray-300 font-semibold">{films.length} Short Films Stored</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Sort Filter Bar */}
        <div className="card-flat p-4 sm:p-6 border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search directors by name or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0C10] border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#F5F5F5] placeholder-gray-500 focus:outline-none focus:border-[#FFD60A]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>

          {/* Sort Toggles */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FFD60A]" /> Sort By:
            </span>

            <button
              onClick={() => setSortBy('rating')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
                sortBy === 'rating'
                  ? 'bg-[#FFD60A] text-[#0B0C10] shadow-md'
                  : 'bg-[#0B0C10] text-gray-300 hover:text-white border border-gray-700'
              }`}
            >
              Highest Rating ★
            </button>

            <button
              onClick={() => setSortBy('films')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
                sortBy === 'films'
                  ? 'bg-[#FFD60A] text-[#0B0C10] shadow-md'
                  : 'bg-[#0B0C10] text-gray-300 hover:text-white border border-gray-700'
              }`}
            >
              Most Films
            </button>

            <button
              onClick={() => setSortBy('followers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
                sortBy === 'followers'
                  ? 'bg-[#FFD60A] text-[#0B0C10] shadow-md'
                  : 'bg-[#0B0C10] text-gray-300 hover:text-white border border-gray-700'
              }`}
            >
              Followers
            </button>
          </div>
        </div>

        {/* Directors List Grid */}
        <div className="space-y-8">
          {filteredDirectors.map((director) => {
            const directorFilms = films.filter((f) => f.director_id === director.id || f.director_name === director.name);
            const isFollowing = followedDirectorIds.includes(director.id);

            return (
              <div
                key={director.id}
                className="card-flat p-6 border-2 border-gray-800 hover:border-[#FFD60A]/50 transition-all space-y-6 shadow-xl"
              >
                {/* Top Director Header Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-700/50 pb-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={director.profile_pic_url}
                      alt={director.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FFD60A] shadow-md shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/director/${director.id}`}
                          className="font-black text-xl text-[#F5F5F5] hover:text-[#FFD60A] transition-colors"
                        >
                          {director.name}
                        </Link>
                        <span className="bg-[#FFD60A]/15 text-[#FFD60A] text-[10px] font-black uppercase px-2 py-0.5 rounded border border-[#FFD60A]/30">
                          Verified Director
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 max-w-xl mt-1 line-clamp-2">{director.bio}</p>
                    </div>
                  </div>

                  {/* Director Stats & Actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Rating</span>
                        <span className="text-sm font-black text-[#FFD60A] flex items-center justify-center gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-current text-[#FFD60A]" />
                          {director.avg_rating.toFixed(1)}
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Vault</span>
                        <span className="text-sm font-black text-[#F5F5F5] flex items-center justify-center gap-1">
                          <Film className="w-3.5 h-3.5 text-gray-400" />
                          {directorFilms.length} Shorts
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFollowDirector(director.id)}
                      className={`text-xs px-4 py-2 rounded-xl font-extrabold transition-all ${
                        isFollowing
                          ? 'bg-[#1F2833] text-gray-300 border border-gray-700'
                          : 'btn-gold shadow-md'
                      }`}
                    >
                      {isFollowing ? 'Following' : '+ Follow'}
                    </button>

                    <Link
                      href={`/director/${director.id}`}
                      className="bg-[#0B0C10] hover:bg-[#0B0C10]/80 p-2.5 rounded-xl border border-gray-700 text-gray-300 hover:text-[#FFD60A] transition-colors"
                      title="Open Director Filmography Vault"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

                {/* Director Movie Collection Horizontal Scroll Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <span>Director Movie Collection ({directorFilms.length})</span>
                    <Link href={`/director/${director.id}`} className="text-[#FFD60A] hover:underline flex items-center gap-0.5">
                      <span>View Full Vault</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {directorFilms.length > 0 ? (
                    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                      {directorFilms.map((film) => (
                        <Link
                          key={film.id}
                          href={`/film/${film.id}`}
                          className="w-48 sm:w-56 shrink-0 bg-[#0B0C10] p-2.5 rounded-xl border border-gray-800 hover:border-[#FFD60A]/40 transition-all group"
                        >
                          <img
                            src={film.thumbnail_url}
                            alt={film.title}
                            className="w-full aspect-video object-cover rounded-lg group-hover:scale-105 transition-transform"
                          />
                          <p className="font-extrabold text-xs text-[#F5F5F5] truncate mt-2 group-hover:text-[#FFD60A] transition-colors">
                            {film.title}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                            <span className="uppercase font-bold text-[#FFD60A]">{film.mood_tag}</span>
                            <span>★ {film.rating_avg.toFixed(1)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic py-2">No short films published yet in this collection.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
