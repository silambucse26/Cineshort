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
  Award
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
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F5] pb-20">
      {/* MASS BLOCKBUSTER HERO BANNER */}
      {featuredFilm && (
        <section className="relative w-full bg-gradient-to-b from-[#1F2833]/90 via-[#0B0C10]/95 to-[#0B0C10] border-b border-[#FFD60A]/20 py-10 md:py-16 px-4 sm:px-6 lg:px-8 mb-10 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FFD60A]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Featured Mass Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-[#E63946] text-white font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-md flex items-center gap-1 shadow-lg animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-current" /> MASS BLOCKBUSTER RELEASE
                </span>
                <span className="bg-[#FFD60A]/20 border border-[#FFD60A] text-[#FFD60A] text-xs font-extrabold px-3 py-0.5 rounded-full flex items-center gap-1">
                  ★ {featuredFilm.rating_avg.toFixed(1)} AUDIENCE SCORE
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#F5F5F5] tracking-tight uppercase leading-none drop-shadow-md">
                {featuredFilm.title}
              </h1>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed line-clamp-3 max-w-2xl">
                {featuredFilm.overview}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-300">
                <div className="flex items-center gap-1.5 text-[#FFD60A]">
                  <Clapperboard className="w-4 h-4" />
                  <span>DIRECTOR: <strong className="text-white uppercase tracking-wider">{featuredFilm.director_name}</strong></span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 text-gray-300">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>CAST: <strong>{featuredFilm.hero_names.join(', ')}</strong></span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 text-[#FFD60A]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{Math.round(featuredFilm.duration_sec / 60)} MIN SHORT</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <Link
                  href={`/film/${featuredFilm.id}`}
                  className="btn-gold text-sm font-black px-8 py-3.5 shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
                >
                  <Play className="w-5 h-5 fill-current text-[#0B0C10]" />
                  <span>STREAM MOVIE NOW</span>
                </Link>

                <Link
                  href={`/director/${featuredFilm.director_id}`}
                  className="bg-[#1F2833] hover:bg-[#1F2833]/80 text-[#F5F5F5] border border-gray-700 px-6 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors"
                >
                  Explore Director Vault
                </Link>
              </div>
            </div>

            {/* Mass Hero Poster Box */}
            <div className="lg:col-span-5 relative group rounded-2xl overflow-hidden border-2 border-[#FFD60A]/40 shadow-[0_0_40px_rgba(255,214,10,0.2)]">
              <img
                src={featuredFilm.thumbnail_url}
                alt={featuredFilm.title}
                className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                <Link
                  href={`/film/${featuredFilm.id}`}
                  className="w-16 h-16 rounded-full bg-[#FFD60A] text-[#0B0C10] flex items-center justify-center pl-1 shadow-2xl group-hover:scale-125 transition-transform duration-300"
                >
                  <Play className="w-8 h-8 fill-current" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Filters Bar & Quick Stats */}
        <div className="card-flat p-5 sm:p-7 space-y-5 border border-[#FFD60A]/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-700/50 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[#FFD60A] text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" /> Mass Short Film Collection
              </div>
              <h2 className="font-black text-xl sm:text-2xl text-[#F5F5F5]">Explore Mass Blockbuster Movies</h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Direct Link to Director Collections Page */}
              <Link
                href="/directors"
                className="flex items-center gap-2 bg-[#FFD60A]/15 hover:bg-[#FFD60A]/25 border border-[#FFD60A]/40 px-4 py-2 rounded-xl text-xs font-bold text-[#FFD60A] transition-all hover:scale-105"
              >
                <Clapperboard className="w-4 h-4" />
                <span>Director Collections</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              {topDirector && (
                <Link
                  href={`/director/${topDirector.id}`}
                  className="hidden sm:flex items-center gap-2 bg-[#0B0C10] hover:bg-[#0B0C10]/80 border border-gray-800 px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 transition-colors"
                >
                  <Trophy className="w-4 h-4 text-[#FFD60A]" />
                  <span>#1 Director: <strong className="text-[#FFD60A]">{topDirector.name}</strong></span>
                </Link>
              )}
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Mood Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto pb-1 lg:pb-0">
              <span className="text-xs font-bold text-gray-400 shrink-0 uppercase tracking-wider">
                Mood:
              </span>
              {moodChips.map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setSelectedMood(chip.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-2 ${
                    selectedMood === chip.value
                      ? 'bg-[#FFD60A] text-[#0B0C10] font-black shadow-lg scale-105'
                      : 'bg-[#0B0C10] text-gray-300 hover:text-white hover:bg-[#0B0C10]/70 border border-gray-700/50'
                  }`}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Duration Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto">
              <span className="text-xs font-bold text-gray-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FFD60A]" /> Runtime:
              </span>
              {durationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedDuration(opt.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                    selectedDuration === opt.value
                      ? 'bg-[#FFD60A] text-[#0B0C10] font-black shadow-md'
                      : 'bg-[#0B0C10] text-gray-300 hover:text-white hover:bg-[#0B0C10]/70 border border-gray-700/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Category Showcase Rows */}
        {selectedMood === 'all' && selectedDuration === 'all' ? (
          <div className="space-y-12">
            {/* Direct Link Banner to Director Collections */}
            <div className="card-flat p-6 border-2 border-[#FFD60A]/40 bg-gradient-to-r from-[#1F2833] via-[#0B0C10] to-[#1F2833] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD60A] text-[#0B0C10] flex items-center justify-center font-black shrink-0 shadow-lg">
                  <Clapperboard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#F5F5F5] uppercase tracking-wide">Director Movie Collections Vault</h3>
                  <p className="text-xs text-gray-300 mt-0.5">Explore full movie filmographies and short film vaults grouped by director.</p>
                </div>
              </div>
              <Link
                href="/directors"
                className="btn-gold text-xs px-6 py-3 font-black shrink-0 uppercase tracking-wider flex items-center gap-2 shadow-xl"
              >
                <span>Browse All Collections</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Row 1: Trending Mass Blockbusters */}
            {trendingFilms.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-l-4 border-[#FFD60A] pl-3">
                  <h2 className="font-black text-lg sm:text-xl text-[#F5F5F5] tracking-wider uppercase flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#FFD60A] fill-current" />
                    <span>Trending Mass Blockbusters</span>
                  </h2>
                  <span className="text-xs text-gray-400 font-bold uppercase">{trendingFilms.length} Movies</span>
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
                <div className="flex items-center justify-between border-l-4 border-[#FFD60A] pl-3">
                  <h2 className="font-black text-lg sm:text-xl text-[#F5F5F5] tracking-wider uppercase flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FFD60A]" />
                    <span>Action & Suspense Thrillers</span>
                  </h2>
                  <span className="text-xs text-gray-400 font-bold uppercase">{thrillerDarkFilms.length} Movies</span>
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
                <div className="flex items-center justify-between border-l-4 border-[#FFD60A] pl-3">
                  <h2 className="font-black text-lg sm:text-xl text-[#F5F5F5] tracking-wider uppercase flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#FFD60A] fill-current" />
                    <span>Uplifting & Romantic Hits</span>
                  </h2>
                  <span className="text-xs text-gray-400 font-bold uppercase">{upliftingRomanceFilms.length} Movies</span>
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
                <div className="flex items-center justify-between border-l-4 border-[#FFD60A] pl-3">
                  <h2 className="font-black text-lg sm:text-xl text-[#F5F5F5] tracking-wider uppercase flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#FFD60A]" />
                    <span>Blockbuster Comedies</span>
                  </h2>
                  <span className="text-xs text-gray-400 font-bold uppercase">{comedyFilms.length} Movies</span>
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
                <div className="flex items-center justify-between border-l-4 border-[#FFD60A] pl-3">
                  <h2 className="font-black text-lg sm:text-xl text-[#F5F5F5] tracking-wider uppercase flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#FFD60A]" />
                    <span>Fresh New Releases</span>
                  </h2>
                  <span className="text-xs text-gray-400 font-bold uppercase">{freshReleases.length} Movies</span>
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
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-gray-400">
              Filtered Movie Vault ({filteredFilms.length})
            </h3>
            {filteredFilms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredFilms.map((film) => (
                  <FilmCard key={film.id} film={film} />
                ))}
              </div>
            ) : (
              <div className="card-flat p-12 text-center space-y-4">
                <Film className="w-12 h-12 text-gray-500 mx-auto" />
                <h3 className="text-lg font-bold text-gray-300">No approved short films match your filter</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Try adjusting your mood tag or runtime options.
                </p>
                <button
                  onClick={() => {
                    setSelectedMood('all');
                    setSelectedDuration('all');
                  }}
                  className="btn-gold text-xs px-5 py-2.5 font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
