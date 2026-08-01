'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Film, 
  Sparkles, 
  Trophy, 
  Play, 
  Clock, 
  Flame, 
  ShieldCheck, 
  Star, 
  ChevronRight,
  Clapperboard,
  Users,
  Award,
  TrendingUp,
  Tv
} from 'lucide-react';
import { useShortFilm } from '../context/ShortFilmContext';
import { FilmCard } from '../components/FilmCard';
import { MoodTag, DurationFilter } from '../types/shortfilm';

export default function HomeFeedPage() {
  const { approvedFilms, directors } = useShortFilm();

  const [selectedMood, setSelectedMood] = useState<MoodTag | 'all'>('all');
  const [selectedDuration, setSelectedDuration] = useState<DurationFilter>('all');

  const moodChips: { label: string; value: MoodTag | 'all'; icon: string }[] = [
    { label: 'All Moods', value: 'all', icon: '✨' },
    { label: 'Uplifting', value: 'uplifting', icon: '🌅' },
    { label: 'Dark', value: 'dark', icon: '🌙' },
    { label: 'Romantic', value: 'romantic', icon: '❤️' },
    { label: 'Thriller', value: 'thriller', icon: '⚡' },
    { label: 'Comedy', value: 'comedy', icon: '🎭' },
  ];

  const durationOptions: { label: string; value: DurationFilter }[] = [
    { label: 'All Durations', value: 'all' },
    { label: 'Under 1 min', value: 'under-1' },
    { label: '1 - 3 min', value: '1-3' },
    { label: '3 - 5 min', value: '3-5' },
  ];

  // Filter ONLY approved films by Mood Tag & Duration Range
  const filteredFilms = approvedFilms.filter((film) => {
    if (selectedMood !== 'all' && film.mood_tag !== selectedMood) {
      return false;
    }
    if (selectedDuration === 'under-1' && film.duration_sec >= 60) return false;
    if (selectedDuration === '1-3' && (film.duration_sec < 60 || film.duration_sec > 180)) return false;
    if (selectedDuration === '3-5' && (film.duration_sec < 180 || film.duration_sec > 300)) return false;

    return true;
  });

  // Category splits
  const trendingFilms = [...approvedFilms]
    .sort((a, b) => b.rating_avg - a.rating_avg)
    .slice(0, 8);

  const thrillerDarkFilms = approvedFilms.filter(
    (f) => f.mood_tag === 'thriller' || f.mood_tag === 'dark'
  );

  const upliftingRomanceFilms = approvedFilms.filter(
    (f) => f.mood_tag === 'uplifting' || f.mood_tag === 'romantic'
  );

  const comedyFilms = approvedFilms.filter((f) => f.mood_tag === 'comedy');

  const freshReleases = [...approvedFilms]
    .sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime())
    .slice(0, 8);

  const featuredFilm = approvedFilms[0];
  const rankedDirectors = [...directors].sort((a, b) => b.avg_rating - a.avg_rating);
  const topDirector = rankedDirectors[0];

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F5] pb-24 selection:bg-[#FFD60A] selection:text-[#0B0C10]">
      {/* 1. CINEMATIC FULL-BLEED HERO BANNER */}
      {featuredFilm ? (
        <section className="relative w-full min-h-[55vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden mb-12 border-b border-gray-900 shadow-2xl">
          {/* Film Thumbnail Background with multi-stage gradient masks */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredFilm.thumbnail_url}
              alt={featuredFilm.title}
              className="w-full h-full object-cover opacity-50 lg:opacity-35 scale-105 transition-transform duration-[10s]"
            />
            {/* Mobile Vertical linear gradient + Desktop Radial/Horizontal mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/85 to-[#0B0C10]/20 lg:hidden z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10] via-[#0B0C10]/80 to-transparent hidden lg:block z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-[#0B0C10]/40 hidden lg:block z-10" />
          </div>

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Description Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="bg-[#E63946] text-white font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-md flex items-center gap-1 shadow-[0_0_15px_rgba(230,57,70,0.4)]">
                  <Flame className="w-3.5 h-3.5 fill-current" /> MASS TRENDING RELEASE
                </span>
                <span className="bg-[#FFD60A]/10 border border-[#FFD60A]/30 text-[#FFD60A] text-[9px] sm:text-xs font-black px-3 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                  ★ {featuredFilm.rating_avg.toFixed(1)} AUDIENCE SCORE
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight uppercase leading-none drop-shadow-lg text-center lg:text-left bg-gradient-to-r from-white via-white to-[#FFD60A] bg-clip-text text-transparent">
                {featuredFilm.title}
              </h1>

              <p className="text-gray-350 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl font-medium drop-shadow text-center lg:text-left">
                {featuredFilm.overview}
              </p>

              {/* Badges and metadata */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-2 text-[9px] sm:text-xs font-bold text-gray-300 bg-[#0B0C10]/60 p-3 rounded-xl border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-1 text-[#FFD60A]">
                  <Clapperboard className="w-3.5 h-3.5" />
                  <span>DIRECTOR: <strong className="text-white uppercase font-black">{featuredFilm.director_name}</strong></span>
                </div>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">CAST: <strong className="text-gray-200">{featuredFilm.hero_names.join(', ')}</strong></span>
                </div>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <div className="flex items-center gap-1 text-[#FFD60A]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{Math.round(featuredFilm.duration_sec / 60)} MIN SHORT</span>
                </div>
              </div>

              {/* Side by side action buttons on mobile */}
              <div className="pt-2 flex flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto">
                <Link
                  href={`/film/${featuredFilm.id}`}
                  className="flex-1 sm:flex-none btn-gold text-[10px] sm:text-xs font-black px-4 sm:px-8 py-3.5 shadow-[0_0_25px_rgba(255,214,10,0.25)] flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-transform rounded-xl"
                >
                  <Play className="w-4 h-4 fill-current text-[#0B0C10]" />
                  <span>STREAM NOW</span>
                </Link>

                <Link
                  href={`/director/${featuredFilm.director_id}`}
                  className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm px-4 sm:px-6 py-3.5 rounded-xl text-[10px] sm:text-xs font-black tracking-wider uppercase transition-colors text-center"
                >
                  <span>DIRECTOR VAULT</span>
                </Link>
              </div>
            </div>

            {/* Right Interactive Player Box */}
            <div className="lg:col-span-5 relative group rounded-2xl overflow-hidden border border-white/10 bg-[#0B0C10] shadow-[0_0_50px_rgba(0,0,0,0.8)] shadow-[0_0_40px_rgba(255,214,10,0.15)]">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={featuredFilm.thumbnail_url}
                  alt={featuredFilm.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Link
                    href={`/film/${featuredFilm.id}`}
                    className="w-16 h-16 rounded-full bg-[#FFD60A] text-[#0B0C10] flex items-center justify-center pl-1 shadow-2xl group-hover:scale-125 transition-transform duration-300"
                  >
                    <Play className="w-8 h-8 fill-current" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Empty State banner placeholder */
        <section className="relative w-full py-16 bg-[#1F2833]/20 border-b border-gray-900 text-center space-y-4">
          <div className="max-w-md mx-auto space-y-2 px-4">
            <Tv className="w-12 h-12 text-[#FFD60A] mx-auto animate-pulse" />
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Awaiting Theater Uploads</h2>
            <p className="text-xs text-gray-400">
              There are currently no approved short films in the catalog. Log in as an administrator to publish files.
            </p>
            <div className="pt-2">
              <Link href="/login" className="btn-gold text-xs px-5 py-2 inline-block font-bold">
                Go to login
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 2. MAIN FEED AND CAROUSELS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Floating glassmorphism filters panel */}
        <div className="bg-[#1F2833]/45 border border-white/5 backdrop-blur-md p-5 rounded-2xl shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[#FFD60A] text-[10px] font-black uppercase tracking-widest mb-0.5">
                <Sparkles className="w-4 h-4 text-[#FFD60A]" /> CineShort Global Catalog
              </div>
              <h2 className="font-extrabold text-lg sm:text-xl text-white">Explore Blockbuster Short Films</h2>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/directors"
                className="flex items-center gap-2 bg-[#FFD60A]/10 hover:bg-[#FFD60A]/20 border border-[#FFD60A]/35 px-4 py-2 rounded-xl text-xs font-black text-[#FFD60A] transition-all hover:scale-105 select-none"
              >
                <Clapperboard className="w-4 h-4" />
                <span>Director Vaults</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              {topDirector && (
                <Link
                  href={`/director/${topDirector.id}`}
                  className="hidden sm:flex items-center gap-2 bg-[#0B0C10] hover:bg-[#0B0C10]/80 border border-white/5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 transition-colors"
                >
                  <Trophy className="w-4 h-4 text-[#FFD60A]" />
                  <span>Rank #1: <strong className="text-[#FFD60A]">{topDirector.name}</strong></span>
                </Link>
              )}
            </div>
          </div>

          {/* Filters Selector pills bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Mood Category selection */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto pb-1 lg:pb-0">
              <span className="text-[10px] font-extrabold text-gray-400 shrink-0 uppercase tracking-widest mr-1">
                Mood:
              </span>
              {moodChips.map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setSelectedMood(chip.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-2 ${
                    selectedMood === chip.value
                      ? 'bg-[#FFD60A] text-[#0B0C10] font-black shadow-[0_0_15px_rgba(255,214,10,0.2)] scale-105'
                      : 'bg-[#0B0C10] text-gray-300 hover:text-white hover:bg-white/5 border border-white/5'
                  }`}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Runtime Category Selection */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto">
              <span className="text-[10px] font-extrabold text-gray-400 shrink-0 uppercase tracking-widest mr-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FFD60A]" /> Runtime:
              </span>
              {durationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedDuration(opt.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                    selectedDuration === opt.value
                      ? 'bg-[#FFD60A] text-[#0B0C10] font-black shadow-md'
                      : 'bg-[#0B0C10] text-gray-300 hover:text-white hover:bg-white/5 border border-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. SHOWCASE ROWS OR FILTER RESULTS */}
        {selectedMood === 'all' && selectedDuration === 'all' ? (
          <div className="space-y-12">
            {/* Row 1: Trending Blockbusters */}
            {trendingFilms.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-l-[3px] border-[#FFD60A] pl-3">
                  <h2 className="font-black text-sm sm:text-base text-white tracking-wider uppercase flex items-center gap-2">
                    <Flame className="w-4.5 h-4.5 text-[#FFD60A] fill-current" />
                    <span>Trending Mass Blockbusters</span>
                  </h2>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{trendingFilms.length} Movies</span>
                </div>

                <div className="flex items-center gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
                  {trendingFilms.map((film) => (
                    <div key={film.id} className="w-[260px] sm:w-[300px] shrink-0 hover:scale-[1.03] transition-transform duration-300">
                      <FilmCard film={film} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Row 2: Action & Suspense Thrillers */}
            {thrillerDarkFilms.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-l-[3px] border-[#FFD60A] pl-3">
                  <h2 className="font-black text-sm sm:text-base text-white tracking-wider uppercase flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-[#FFD60A]" />
                    <span>Action & Suspense Thrillers</span>
                  </h2>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{thrillerDarkFilms.length} Movies</span>
                </div>

                <div className="flex items-center gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
                  {thrillerDarkFilms.map((film) => (
                    <div key={film.id} className="w-[260px] sm:w-[300px] shrink-0 hover:scale-[1.03] transition-transform duration-300">
                      <FilmCard film={film} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Row 3: Uplifting & Romantic Hits */}
            {upliftingRomanceFilms.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-l-[3px] border-[#FFD60A] pl-3">
                  <h2 className="font-black text-sm sm:text-base text-white tracking-wider uppercase flex items-center gap-2">
                    <Star className="w-4.5 h-4.5 text-[#FFD60A] fill-current" />
                    <span>Uplifting & Romantic Hits</span>
                  </h2>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{upliftingRomanceFilms.length} Movies</span>
                </div>

                <div className="flex items-center gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
                  {upliftingRomanceFilms.map((film) => (
                    <div key={film.id} className="w-[260px] sm:w-[300px] shrink-0 hover:scale-[1.03] transition-transform duration-300">
                      <FilmCard film={film} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Row 4: Blockbuster Comedies */}
            {comedyFilms.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-l-[3px] border-[#FFD60A] pl-3">
                  <h2 className="font-black text-sm sm:text-base text-white tracking-wider uppercase flex items-center gap-2">
                    <Trophy className="w-4.5 h-4.5 text-[#FFD60A]" />
                    <span>Blockbuster Comedies</span>
                  </h2>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{comedyFilms.length} Movies</span>
                </div>

                <div className="flex items-center gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
                  {comedyFilms.map((film) => (
                    <div key={film.id} className="w-[260px] sm:w-[300px] shrink-0 hover:scale-[1.03] transition-transform duration-300">
                      <FilmCard film={film} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Row 5: Fresh Releases */}
            {freshReleases.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-l-[3px] border-[#FFD60A] pl-3">
                  <h2 className="font-black text-sm sm:text-base text-white tracking-wider uppercase flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-[#FFD60A]" />
                    <span>Fresh New Releases</span>
                  </h2>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{freshReleases.length} Movies</span>
                </div>

                <div className="flex items-center gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
                  {freshReleases.map((film) => (
                    <div key={film.id} className="w-[260px] sm:w-[300px] shrink-0 hover:scale-[1.03] transition-transform duration-300">
                      <FilmCard film={film} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Filtered Results Grid */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-l-[3px] border-[#FFD60A] pl-3">
              <h2 className="font-black text-sm sm:text-base text-white uppercase tracking-wider">
                Search Results
              </h2>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {filteredFilms.length} {filteredFilms.length === 1 ? 'Movie' : 'Movies'} Found
              </span>
            </div>

            {filteredFilms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFilms.map((film) => (
                  <FilmCard key={film.id} film={film} />
                ))}
              </div>
            ) : (
              <div className="card-flat p-12 text-center space-y-3 border border-gray-800 bg-[#1F2833]/15">
                <span className="text-3xl">🍿</span>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">No Matches Found</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  We couldn't find any films matching the selected mood and duration. Choose different filter combinations.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => { setSelectedMood('all'); setSelectedDuration('all'); }}
                    className="btn-gold text-xs px-4 py-2 font-bold"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
