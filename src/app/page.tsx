'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  Tv,
  Plus,
  Settings,
  Bookmark,
  Check
} from 'lucide-react';
import { useShortFilm } from '../context/ShortFilmContext';
import { FilmCard } from '../components/FilmCard';
import { MoodTag, DurationFilter } from '../types/shortfilm';

function HomeFeedContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') || 'all';

  const { approvedFilms, directors, toggleWishlist, isInWishlist, wishlistFilmIds } = useShortFilm();

  const [selectedMood, setSelectedMood] = useState<MoodTag | 'all'>('all');
  const [selectedDuration, setSelectedDuration] = useState<DurationFilter>('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'series' | 'movies'>(
    typeParam === 'series' ? 'series' : typeParam === 'movies' ? 'movies' : 'all'
  );

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

  // Filter ONLY approved films by Mood Tag, Duration Range, & Type Tab
  const filteredFilms = approvedFilms.filter((film) => {
    if (activeTab === 'series' && film.duration_sec <= 120) return false;
    if (activeTab === 'movies' && film.duration_sec > 180) return false;

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
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F5] pb-6 md:pb-12 selection:bg-[#FFD60A] selection:text-[#0B0C10] relative">
      
      {/* AMBIENT MOBILE FULL-BLEED BACKDROP */}
      {featuredFilm && (
        <div className="md:hidden absolute -top-14 inset-x-0 h-[85vh] overflow-hidden pointer-events-none z-0 select-none">
          <img
            src={featuredFilm.thumbnail_url}
            alt=""
            className="w-full h-full object-cover opacity-35 scale-125 blur-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C10]/30 via-[#0B0C10]/75 to-[#0B0C10]" />
        </div>
      )}

      {/* 0. MOBILE TOP PILLS (TV Shows, Movies, Categories) */}
      <div className="md:hidden pt-3 pb-2 px-4 flex items-center justify-center gap-2.5 z-30 relative select-none">
        <button
          onClick={() => {
            setActiveTab('series');
            setShowMobileFilters(false);
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
            activeTab === 'series'
              ? 'bg-white text-black border-white shadow-md'
              : 'bg-black/40 text-gray-200 border-white/20 hover:border-white/40 backdrop-blur'
          }`}
        >
          TV Shows
        </button>

        <button
          onClick={() => {
            setActiveTab('movies');
            setShowMobileFilters(false);
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
            activeTab === 'movies'
              ? 'bg-white text-black border-white shadow-md'
              : 'bg-black/40 text-gray-200 border-white/20 hover:border-white/40 backdrop-blur'
          }`}
        >
          Movies
        </button>

        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1 ${
            showMobileFilters || selectedMood !== 'all' || selectedDuration !== 'all'
              ? 'bg-[#E50914] text-white border-[#E50914] shadow-md'
              : 'bg-black/40 text-gray-200 border-white/20 hover:border-white/40 backdrop-blur'
          }`}
        >
          <span>Categories</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showMobileFilters ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* 1A. MOBILE NETFLIX-STYLE VERTICAL HERO CARD (Visible on Mobile/Tablet) */}
      {featuredFilm && (
        <section className="md:hidden px-4 py-2 mb-6">
          <div className="relative aspect-[3/4] max-w-[340px] mx-auto rounded-[1.8rem] overflow-hidden border border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.9)] bg-[#0B0C10] group">
            {/* Background Poster Image */}
            <img
              src={featuredFilm.thumbnail_url}
              alt={featuredFilm.title}
              className="w-full h-full object-cover object-center"
            />

            {/* Bottom Immersive Gradient Mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10 flex flex-col justify-end p-5 text-center">
              {/* Title & Underline effect */}
              <div className="space-y-1 mb-2">
                <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white drop-shadow-md">
                  {featuredFilm.title}
                </h1>
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#E50914] to-transparent mx-auto" />
                <p className="text-[11px] text-[#FFD60A] font-semibold tracking-wide">
                  New episode coming on Sunday
                </p>
              </div>

              {/* Tag pill list */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] font-medium text-gray-300 mb-4 px-2">
                <span>Riveting</span>
                <span>•</span>
                <span>Drama</span>
                <span>•</span>
                <span>{featuredFilm.mood_tag.toUpperCase()}</span>
                <span>•</span>
                <span>Workplace</span>
                <span>•</span>
                <span>TV</span>
              </div>

              {/* Action Buttons: Play (White) and + My List (Grey) */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/film/${featuredFilm.id}`}
                  className="flex-1 bg-white hover:bg-gray-200 text-black font-extrabold text-xs py-2.5 px-4 rounded-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current text-black" />
                  <span>Play</span>
                </Link>

                <button
                  type="button"
                  onClick={() => toggleWishlist(featuredFilm.id)}
                  className={`flex-1 font-extrabold text-xs py-2.5 px-4 rounded-md flex items-center justify-center gap-1.5 border transition-all active:scale-95 shadow-lg backdrop-blur-md ${
                    isInWishlist(featuredFilm.id)
                      ? 'bg-red-600/90 border-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                      : 'bg-white/20 hover:bg-white/30 border-white/20 text-white'
                  }`}
                >
                  {isInWishlist(featuredFilm.id) ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Wishlisted</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-white" />
                      <span>My List</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 1B. DESKTOP CINEMATIC HERO BANNER (Visible on md and larger) */}
      {featuredFilm ? (
        <section className="hidden md:flex relative w-full min-h-[55vh] sm:min-h-[70vh] items-center justify-center overflow-hidden mb-12 border-b border-gray-900 shadow-2xl">
          <div className="absolute inset-0 z-0">
            <img
              src={featuredFilm.thumbnail_url}
              alt={featuredFilm.title}
              className="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-[10s]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10] via-[#0B0C10]/80 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-[#0B0C10]/40 z-10" />
          </div>

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6 text-left flex flex-col items-start">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#E63946] text-white font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-md flex items-center gap-1 shadow-[0_0_15px_rgba(230,57,70,0.4)]">
                  <Flame className="w-3.5 h-3.5 fill-current" /> MASS TRENDING RELEASE
                </span>
                <span className="bg-[#FFD60A]/10 border border-[#FFD60A]/30 text-[#FFD60A] text-xs font-black px-3 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                  ★ {featuredFilm.rating_avg.toFixed(1)} AUDIENCE SCORE
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black tracking-tight uppercase leading-none drop-shadow-lg text-left bg-gradient-to-r from-white via-white to-[#FFD60A] bg-clip-text text-transparent">
                {featuredFilm.title}
              </h1>

              <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl font-medium drop-shadow text-left">
                {featuredFilm.overview}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold text-gray-300 bg-[#0B0C10]/60 p-3 rounded-xl border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-1 text-[#FFD60A]">
                  <Clapperboard className="w-3.5 h-3.5" />
                  <span>DIRECTOR: <strong className="text-white uppercase font-black">{featuredFilm.director_name}</strong></span>
                </div>
                <span className="text-gray-600">•</span>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate max-w-[200px]">CAST: <strong className="text-gray-200">{featuredFilm.hero_names.join(', ')}</strong></span>
                </div>
                <span className="text-gray-600">•</span>
                <div className="flex items-center gap-1 text-[#FFD60A]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{Math.round(featuredFilm.duration_sec / 60)} MIN SHORT</span>
                </div>
              </div>

              <div className="pt-2 flex flex-row items-center gap-3">
                <Link
                  href={`/film/${featuredFilm.id}`}
                  className="btn-gold text-xs font-black px-8 py-3.5 shadow-[0_0_25px_rgba(255,214,10,0.25)] flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform rounded-xl"
                >
                  <Play className="w-4 h-4 fill-current text-[#0B0C10]" />
                  <span>STREAM NOW</span>
                </Link>

                <Link
                  href={`/director/${featuredFilm.director_id}`}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm px-6 py-3.5 rounded-xl text-xs font-black tracking-wider uppercase transition-colors text-center"
                >
                  <span>DIRECTOR VAULT</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative group rounded-2xl overflow-hidden border border-white/10 hover:border-[#FFD60A]/40 bg-[#0B0C10] shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-500">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={featuredFilm.thumbnail_url}
                  alt={featuredFilm.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-[#0B0C10]/80 border border-[#FFD60A]/40 text-[#FFD60A] text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-md backdrop-blur-md">
                    Featured Trailer
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Link
                    href={`/film/${featuredFilm.id}`}
                    className="w-16 h-16 rounded-full bg-[#FFD60A] hover:bg-[#ffe043] text-[#0B0C10] flex items-center justify-center pl-1 shadow-[0_0_20px_rgba(255,214,10,0.4)] group-hover:scale-110 transition-all"
                  >
                    <Play className="w-8 h-8 fill-current text-[#0B0C10]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative w-full py-16 bg-[#1F2833]/20 border-b border-gray-900 text-center space-y-4">
          <div className="max-w-md mx-auto space-y-2 px-4">
            <Tv className="w-12 h-12 text-[#FFD60A] mx-auto animate-pulse" />
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Awaiting Theater Uploads</h2>
            <p className="text-xs text-gray-400">
              There are currently no approved short films in the catalog.
            </p>
          </div>
        </section>
      )}


      {/* 3. MAIN FEED AND CAROUSELS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Mobile Toggleable Filters or Desktop Always Visible Panel */}
        <div className={`bg-[#1F2833]/45 border border-white/5 backdrop-blur-md p-5 rounded-2xl shadow-xl space-y-5 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
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
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
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
                      ? 'bg-[#E50914] text-white font-black shadow-md scale-105'
                      : 'bg-[#0B0C10] text-gray-300 hover:text-white hover:bg-white/5 border border-white/5'
                  }`}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

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

        {/* SHOWCASE ROWS OR FILTER RESULTS */}
        {selectedMood === 'all' && selectedDuration === 'all' && activeTab === 'all' ? (
          <div className="space-y-10">
            {/* Row 0: My Saved Wishlist */}
            {wishlistFilmIds.length > 0 && (
              <div className="space-y-4 bg-[#1F2833]/30 p-4 rounded-2xl border border-red-500/30">
                <div className="flex items-center justify-between border-l-[3px] border-red-500 pl-3">
                  <h2 className="font-black text-sm sm:text-base text-white tracking-wider uppercase flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-red-500 fill-current" />
                    <span>My Saved Wishlist ({wishlistFilmIds.length})</span>
                  </h2>
                  <Link href="/profile" className="text-[10px] text-[#FFD60A] font-bold uppercase tracking-widest hover:underline">
                    View All Wishlist →
                  </Link>
                </div>

                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
                  {approvedFilms
                    .filter((f) => wishlistFilmIds.includes(f.id))
                    .map((film) => (
                      <div key={film.id} className="w-[240px] sm:w-[280px] shrink-0 hover:scale-[1.03] transition-transform duration-300">
                        <FilmCard film={film} />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Row 1: Trending Blockbusters */}
            {trendingFilms.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-l-[3px] border-[#E50914] pl-3">
                  <h2 className="font-black text-sm sm:text-base text-white tracking-wider uppercase flex items-center gap-2">
                    <Flame className="w-4.5 h-4.5 text-[#E50914] fill-current" />
                    <span>Trending Mass Blockbusters</span>
                  </h2>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{trendingFilms.length} Movies</span>
                </div>

                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
                  {trendingFilms.map((film) => (
                    <div key={film.id} className="w-[240px] sm:w-[280px] shrink-0 hover:scale-[1.03] transition-transform duration-300">
                      <FilmCard film={film} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Row 2: Action & Suspense Thrillers */}
            {thrillerDarkFilms.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-l-[3px] border-[#E50914] pl-3">
                  <h2 className="font-black text-sm sm:text-base text-white tracking-wider uppercase flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-[#FFD60A]" />
                    <span>Action & Suspense Thrillers</span>
                  </h2>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{thrillerDarkFilms.length} Movies</span>
                </div>

                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
                  {thrillerDarkFilms.map((film) => (
                    <div key={film.id} className="w-[240px] sm:w-[280px] shrink-0 hover:scale-[1.03] transition-transform duration-300">
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

                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
                  {upliftingRomanceFilms.map((film) => (
                    <div key={film.id} className="w-[240px] sm:w-[280px] shrink-0 hover:scale-[1.03] transition-transform duration-300">
                      <FilmCard film={film} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Row 4: Fresh Releases */}
            {freshReleases.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-l-[3px] border-white pl-3">
                  <h2 className="font-black text-sm sm:text-base text-white tracking-wider uppercase flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-white" />
                    <span>Fresh New Releases</span>
                  </h2>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{freshReleases.length} Movies</span>
                </div>

                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
                  {freshReleases.map((film) => (
                    <div key={film.id} className="w-[240px] sm:w-[280px] shrink-0 hover:scale-[1.03] transition-transform duration-300">
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
            <div className="flex items-center justify-between border-l-[3px] border-[#E50914] pl-3">
              <h2 className="font-black text-sm sm:text-base text-white uppercase tracking-wider">
                {activeTab === 'series' ? 'TV Shows & Series' : activeTab === 'movies' ? 'Movies & Shorts' : 'Filter Results'}
              </h2>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {filteredFilms.length} {filteredFilms.length === 1 ? 'Film' : 'Films'} Found
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
                  We couldn't find any films matching the selected filters. Choose different combinations.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => { 
                      setSelectedMood('all'); 
                      setSelectedDuration('all');
                      setActiveTab('all');
                    }}
                    className="bg-[#E50914] text-white text-xs px-4 py-2 font-bold rounded-lg"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. FLOATING SETTINGS GEAR BUTTON (Mobile Screen Right Side) */}
      <Link
        href="/profile"
        className="md:hidden fixed bottom-20 right-4 z-40 bg-[#1F2833]/90 hover:bg-[#1F2833] text-white p-3.5 rounded-full border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md active:scale-95 transition-all flex items-center justify-center"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-gray-200 animate-spin-slow" />
      </Link>
    </div>
  );
}

export default function HomeFeedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-gray-400 text-xs">
        Loading CineShort...
      </div>
    }>
      <HomeFeedContent />
    </Suspense>
  );
}
