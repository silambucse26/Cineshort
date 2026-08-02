'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Film, 
  Search, 
  Upload, 
  Trophy, 
  User, 
  CheckCircle2, 
  Star, 
  Sparkles, 
  X, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  Home,
  Menu,
  ChevronRight,
  Eye,
  Clapperboard,
  Tv,
  Settings
} from 'lucide-react';
import { useShortFilm } from '../context/ShortFilmContext';

export const CineShortLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <div className={`rounded-xl bg-gradient-to-tr from-[#F4A300] to-[#FFD60A] text-[#0B0C10] flex items-center justify-center font-black shadow-[0_0_14px_rgba(255,214,10,0.45)] ${className}`}>
    <Film className="w-[60%] h-[60%] fill-current text-[#0B0C10]" />
  </div>
);

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { activePersona, logoutUser, films } = useShortFilm();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Close search on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = searchQuery.trim()
    ? films
        .filter(
          (f) =>
            f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.director_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.hero_names.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase())) ||
            f.mood_tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const isAdmin = activePersona?.role === 'admin';
  const isLoggedIn = Boolean(activePersona?.email);

  // Profile Action Wrapper
  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <>
      {/* 1. DESKTOP LEFT SIDEBAR NAVIGATION (md:flex) */}
      <aside 
        className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 hover:w-56 bg-[#0B0C10]/95 border-r border-[#1F2833]/80 flex-col justify-between items-center py-6 z-50 transition-all duration-300 group/sidebar shadow-[4px_0_24px_rgba(0,0,0,0.5)] backdrop-blur-md"
      >
        {/* Brand Logo Section */}
        <div className="w-full px-4 flex justify-start items-center overflow-hidden">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <CineShortLogo className="w-11 h-11" />
            <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 select-none">
              <span className="text-sm font-black tracking-tight text-[#F5F5F5] block">
                CINE<span className="text-[#FFD60A]">SHORT</span>
              </span>
              <span className="text-[8px] uppercase font-bold tracking-widest text-[#F4A300] block -mt-1 shrink-0">
                PRO EDITION
              </span>
            </div>
          </Link>
        </div>

        {/* Middle Navigation Links */}
        <nav className="flex-1 w-full flex flex-col items-start gap-1 px-3.5 justify-center">
          {/* Home Link */}
          <Link
            href="/"
            className={`w-full flex items-center gap-4 py-3.5 px-4 rounded-xl transition-all ${
              pathname === '/'
                ? 'bg-[#1F2833] text-[#FFD60A] font-bold shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-[#1F2833]/40'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-semibold text-xs select-none truncate">
              Home Feed
            </span>
          </Link>

          {/* Directors Movie Collections Vault */}
          <Link
            href="/directors"
            className={`w-full flex items-center gap-4 py-3.5 px-4 rounded-xl transition-all ${
              pathname === '/directors'
                ? 'bg-[#1F2833] text-[#FFD60A] font-bold shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-[#1F2833]/40'
            }`}
          >
            <Clapperboard className="w-5 h-5 shrink-0 text-[#FFD60A]" />
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-semibold text-xs select-none truncate">
              Directors Vault
            </span>
          </Link>

          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-4 py-3.5 px-4 rounded-xl text-gray-400 hover:text-white hover:bg-[#1F2833]/40 transition-all text-left"
          >
            <Search className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-semibold text-xs select-none truncate">
              Search Films
            </span>
          </button>

          {/* Profile Link (Shown if logged in) */}
          {isLoggedIn && (
            <Link
              href="/profile"
              className={`w-full flex items-center gap-4 py-3.5 px-4 rounded-xl transition-all ${
                pathname === '/profile'
                  ? 'bg-[#1F2833] text-[#FFD60A] font-bold shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-[#1F2833]/40'
              }`}
            >
              <User className="w-5 h-5 shrink-0" />
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-semibold text-xs select-none truncate">
                My Profile
              </span>
            </Link>
          )}

          {/* Admin Restricted: Leaderboard */}
          {isAdmin && (
            <Link
              href="/leaderboard"
              className={`w-full flex items-center gap-4 py-3.5 px-4 rounded-xl transition-all ${
                pathname === '/leaderboard'
                  ? 'bg-[#1F2833] text-[#F4A300] font-bold shadow-md'
                  : 'text-gray-400 hover:text-[#F4A300] hover:bg-[#1F2833]/40'
              }`}
            >
              <Trophy className="w-5 h-5 shrink-0 text-[#F4A300]" />
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-semibold text-xs select-none truncate text-[#F4A300]">
                Leaderboard
              </span>
            </Link>
          )}

          {/* Admin Restricted: Upload Movie */}
          {isAdmin && (
            <Link
              href="/upload"
              className={`w-full flex items-center gap-4 py-3.5 px-4 rounded-xl transition-all ${
                pathname === '/upload'
                  ? 'bg-[#1F2833] text-[#FFD60A] font-bold shadow-md'
                  : 'text-gray-400 hover:text-[#FFD60A] hover:bg-[#1F2833]/40'
              }`}
            >
              <Upload className="w-5 h-5 shrink-0 text-[#FFD60A]" />
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-semibold text-xs select-none truncate text-[#FFD60A]">
                Upload Film
              </span>
            </Link>
          )}

          {/* Admin Restricted: Admin Panel */}
          {isAdmin && (
            <Link
              href="/admin"
              className={`w-full flex items-center gap-4 py-3.5 px-4 rounded-xl transition-all ${
                pathname.startsWith('/admin') && pathname !== '/admin/login'
                  ? 'bg-[#1F2833] text-[#FFD60A] font-bold shadow-md'
                  : 'text-gray-400 hover:text-[#FFD60A] hover:bg-[#1F2833]/40'
              }`}
            >
              <ShieldCheck className="w-5 h-5 shrink-0 text-[#FFD60A]" />
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-semibold text-xs select-none truncate text-[#FFD60A]">
                Admin Dashboard
              </span>
            </Link>
          )}
        </nav>

        {/* Bottom Profile / Login Button */}
        <div className="w-full px-3.5 relative">
          <button
            onClick={handleProfileClick}
            className="w-full flex items-center gap-3 p-2 rounded-xl bg-[#1F2833]/60 hover:bg-[#1F2833] border border-[#FFD60A]/20 hover:border-[#FFD60A]/50 transition-all text-left"
          >
            <img
              src={activePersona.avatar}
              alt={activePersona.name}
              className="w-8 h-8 rounded-lg object-cover border border-[#FFD60A] shrink-0"
            />
            <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 overflow-hidden leading-none select-none">
              <span className="text-[10px] text-[#FFD60A] uppercase font-bold block mb-0.5 tracking-wider shrink-0">
                {activePersona.role}
              </span>
              <span className="text-[11px] font-bold text-[#F5F5F5] truncate block max-w-[100px]">
                {activePersona.name.split(' ')[0]}
              </span>
            </div>
          </button>

          {/* Desktop Hover/Click Profile Panel */}
          {showProfileMenu && (
            <div 
              className="absolute left-24 bottom-0 w-64 bg-[#1F2833] border border-[#FFD60A]/30 rounded-2xl shadow-2xl p-4 z-50 text-xs text-[#F5F5F5] space-y-3"
            >
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-700/60">
                    <img src={activePersona.avatar} alt={activePersona.name} className="w-10 h-10 rounded-full object-cover border border-[#FFD60A]" />
                    <div className="overflow-hidden">
                      <div className="font-bold text-sm truncate">{activePersona.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">{activePersona.email}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 w-full p-2 bg-[#F4A300]/10 hover:bg-[#F4A300]/20 border border-[#F4A300]/30 text-[#FFD60A] rounded-lg transition-colors font-bold justify-center"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 w-full p-2 bg-[#0B0C10] hover:bg-[#0B0C10]/80 border border-gray-800 text-gray-200 rounded-lg transition-colors font-bold justify-center"
                    >
                      <User className="w-4 h-4 text-[#FFD60A]" />
                      <span>Edit Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        logoutUser();
                        setShowProfileMenu(false);
                        router.push('/');
                      }}
                      className="flex items-center gap-2 w-full p-2 bg-red-950/20 hover:bg-red-950/40 border border-[#E63946]/30 text-[#E63946] rounded-lg transition-colors font-bold justify-center"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-[11px] text-gray-300">You are browsing in guest mode. Watch premium shorts by authenticating.</p>
                  <Link
                    href="/login"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center justify-center gap-2 w-full p-2.5 bg-[#FFD60A] hover:bg-[#ffe043] text-[#0B0C10] font-black uppercase tracking-wider rounded-lg text-[10px] shadow-md transition-transform active:scale-95"
                  >
                    <LogIn className="w-4 h-4 text-[#0B0C10]" />
                    <span>Sign In / Register</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>


      {/* 2. MOBILE BOTTOM NAVIGATION BAR (md:hidden) */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0B0C10]/95 border-t border-white/10 flex justify-around items-center z-50 px-2 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.8)] select-none"
      >
        {/* 1. Mobile Home */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
            pathname === '/' ? 'text-[#FFD60A] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wider">Home</span>
        </Link>

        {/* 2. Mobile Directors Collection / Vault */}
        <Link
          href="/directors"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
            pathname === '/directors' ? 'text-[#FFD60A] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Clapperboard className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wider">Vault</span>
        </Link>

        {/* 3. Mobile Center Brand Logo (CineShort Application Logo) */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center py-1 px-2.5 hover:scale-110 active:scale-95 transition-transform"
        >
          <CineShortLogo className="w-9 h-9" />
        </Link>

        {/* 4. Mobile Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wider">Search</span>
        </button>

        {/* 5. Mobile Setting / Profile Link */}
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
            pathname === '/profile' ? 'text-[#FFD60A] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wider">Setting</span>
        </Link>
      </nav>

      {/* 2a. MOBILE TOP LOGO BAR (md:hidden) */}
      <header 
        className="md:hidden fixed top-0 left-0 right-0 h-14 bg-gradient-to-b from-[#0B0C10]/95 to-[#0B0C10]/80 border-b border-white/5 flex items-center justify-between px-4 z-40 backdrop-blur-md shadow-md"
      >
        <Link href="/" className="flex items-center gap-2 group">
          <CineShortLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
          <span className="text-xs font-black tracking-wider text-[#F5F5F5] uppercase">
            CINE<span className="text-[#FFD60A]">SHORT</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-1.5 text-gray-300 hover:text-[#FFD60A] active:scale-95 transition-all"
            aria-label="Search short films"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Profile Avatar Trigger */}
          <button
            onClick={handleProfileClick}
            className="w-8 h-8 rounded-lg bg-[#FFD60A]/10 flex items-center justify-center overflow-hidden border border-[#FFD60A]/40 shadow-md active:scale-95 transition-transform relative"
            aria-label="Profile Menu"
          >
            <img
              src={activePersona.avatar}
              alt={activePersona.name}
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </header>

      {/* 3. PREMIUM FULLSCREEN SEARCH MODAL OVERLAY */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-[#0B0C10]/95 backdrop-blur-md flex flex-col justify-start items-center pt-20 px-4 md:px-8 select-none"
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
        >
          {/* Close button */}
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            className="absolute top-6 right-6 md:top-8 md:right-8 p-3 rounded-full bg-gray-800/50 hover:bg-[#E63946] hover:text-white text-gray-300 transition-colors shadow-lg z-[110]"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Search Input Box */}
          <div 
            className="max-w-2xl w-full flex flex-col items-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center bg-[#1F2833]/90 rounded-2xl border-2 border-[#FFD60A] px-5 py-4 shadow-[0_0_35px_rgba(255,214,10,0.25)] transition-all">
              <Search className="w-6 h-6 text-[#FFD60A] mr-4 shrink-0" />
              <input
                type="text"
                placeholder="Search short films by title, director, cast, or mood..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="bg-transparent text-lg text-[#F5F5F5] placeholder-gray-500 focus:outline-none w-full font-bold"
              />
            </div>
            
            <p className="text-xs text-gray-400 tracking-wide font-medium">
              Type to search • Press <kbd className="bg-[#1F2833] px-1.5 py-0.5 rounded border border-gray-700 font-mono text-[10px] text-white">ESC</kbd> to close
            </p>
          </div>

          {/* Results List Grid */}
          <div 
            className="max-w-4xl w-full mt-10 overflow-y-auto max-h-[60vh] pb-8 pr-1 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {searchQuery.trim() !== '' && (
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-gray-400 mb-2">
                Matching Results ({searchResults.length})
              </h3>
            )}
            
            {searchResults.length > 0 ? (
              searchResults.map((film) => (
                <button
                  key={film.id}
                  onClick={() => {
                    router.push(`/film/${film.id}`);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center gap-4 p-3 bg-[#1F2833]/40 hover:bg-[#1F2833] border border-transparent hover:border-[#FFD60A]/40 rounded-xl transition-all text-left group"
                >
                  <img
                    src={film.thumbnail_url}
                    alt={film.title}
                    className="w-16 h-10 rounded-lg object-cover border border-gray-800 shrink-0 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-sm text-[#F5F5F5] truncate group-hover:text-[#FFD60A] transition-colors">{film.title}</p>
                    <p className="text-xs text-gray-400 truncate">
                      Director: <strong className="text-white">{film.director_name}</strong> • Cast: {film.hero_names.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-black uppercase bg-[#FFD60A]/10 text-[#FFD60A] px-2.5 py-1 rounded-md border border-[#FFD60A]/20">
                      {film.mood_tag}
                    </span>
                    <span className="text-sm font-black text-[#F4A300] flex items-center gap-0.5">
                      ★ {film.rating_avg.toFixed(1)}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              searchQuery.trim() !== '' && (
                <div className="text-center py-12 text-gray-500 space-y-2">
                  <Film className="w-10 h-10 mx-auto text-gray-600 animate-pulse" />
                  <p className="text-sm font-bold text-gray-400">No match found for &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-xs">Verify the spelling or search by mood tag (e.g., &ldquo;thriller&rdquo;).</p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
