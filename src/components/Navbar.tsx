'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Film, LogOut, Shield, Heart, Plus, User, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserActions } from '../context/UserActionsContext';
import { searchMovies, getImageUrl } from '../services/tmdb';
import { Movie } from '../types';
import MovieImage from './MovieImage';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, updateAvatar } = useAuth();
  const { watchlist } = useUserActions();

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  // Monitor scroll height to make navbar opaque/translucent
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Search Input Change
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length > 1) {
        const results = await searchMovies(searchQuery);
        setSearchResults(results.slice(0, 5)); // show top 5 in quick dropdown
        setShowSearchDropdown(true);
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      performSearch();
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleAvatarChange = () => {
    const seed = Math.floor(Math.random() * 1000);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    updateAvatar(newAvatar);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Collections', path: '/collections' },
    { label: 'Search', path: '/search' }
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-40 transition-all duration-500 py-3 md:py-4 px-4 md:px-8 flex items-center justify-between ${
        isScrolled ? 'glass-nav shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      {/* Brand Logo & Main Nav */}
      <div className="flex items-center gap-6 md:gap-10">
        <Link href="/" className="flex items-center gap-1.5 focus:outline-none">
          <Film className="text-brand-red fill-brand-red w-7 h-7 sm:w-8 sm:h-8" />
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-brand-red bg-clip-text">
            STREAMIX
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-semibold tracking-wide transition-colors duration-200 hover:text-brand-red ${
                  isActive ? 'text-brand-red' : 'text-netflix-light/95'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {user && (
            <Link
              href="/search?myList=true"
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 hover:text-brand-red flex items-center gap-1 ${
                pathname === '/search' && router.toString().includes('myList') ? 'text-brand-red' : 'text-netflix-light/95'
              }`}
            >
              My List
              {watchlist.length > 0 && (
                <span className="bg-brand-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {watchlist.length}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>

      {/* Right Search, Profile & Auth Section */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Instant Search Bar */}
        <div ref={searchContainerRef} className="relative hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <input
              type="text"
              placeholder="Titles, people, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/40 border border-white/20 hover:border-white/40 focus:border-brand-red focus:bg-black/80 rounded-full py-1.5 pl-4 pr-10 text-sm text-white w-[200px] md:w-[260px] focus:w-[240px] md:focus:w-[320px] transition-all duration-300 focus:outline-none backdrop-blur-sm"
            />
            <button type="submit" className="absolute right-3 text-white/60 hover:text-white">
              <Search size={16} />
            </button>
          </form>

          {/* Quick Search Results Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute right-0 mt-2 w-[320px] md:w-[360px] rounded-lg border border-white/10 glass-panel shadow-2xl overflow-hidden p-2 z-50">
              <div className="text-xs text-netflix-gray font-bold uppercase tracking-wider px-3 py-1.5 border-b border-white/5">
                Quick Matches
              </div>
              <div className="flex flex-col">
                {searchResults.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/movie/${movie.id}`}
                    onClick={() => setShowSearchDropdown(false)}
                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-md transition-colors"
                  >
                    <div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-neutral-900">
                      <MovieImage
                        path={movie.posterPath}
                        title={movie.title}
                        releaseYear={movie.releaseYear}
                        genres={movie.genres}
                        fallbackType="poster"
                        size="w300"
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <h4 className="text-white text-sm font-semibold truncate">{movie.title}</h4>
                      <p className="text-xs text-netflix-gray font-medium">
                        {movie.releaseYear} • {movie.runtime} • {movie.rating} ★
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={`/search?q=${encodeURIComponent(searchQuery)}`}
                onClick={() => setShowSearchDropdown(false)}
                className="block text-center text-xs text-brand-red hover:underline font-bold py-2 border-t border-white/5 bg-black/25"
              >
                See all results for "{searchQuery}"
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Search Button redirect */}
        <Link href="/search" className="sm:hidden text-white/80 hover:text-white p-1">
          <Search size={22} />
        </Link>

        {/* Profile Dropdown or Login Button */}
        {user ? (
          <div ref={profileContainerRef} className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-md overflow-hidden border border-brand-red/60 hover:border-brand-red cursor-pointer relative bg-neutral-950 flex items-center justify-center">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-white/10 glass-panel shadow-2xl overflow-hidden p-1 z-50">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-xs text-netflix-gray font-medium">Signed in as</p>
                  <p className="text-sm font-bold text-white truncate">{user.username}</p>
                  <span className="inline-block bg-brand-red/10 border border-brand-red/30 text-brand-red text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 capitalize">
                    {user.role} Account
                  </span>
                </div>

                <div className="p-1 flex flex-col gap-0.5">
                  <button
                    onClick={handleAvatarChange}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-white/85 hover:text-white hover:bg-white/5 rounded-md transition-colors w-full text-left"
                  >
                    <ImageIcon size={14} className="text-netflix-gray" />
                    Shuffle Avatar
                  </button>

                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-white/85 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    >
                      <Shield size={14} className="text-netflix-gray" />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    href="/search?myList=true"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex md:hidden items-center gap-2.5 px-3 py-2 text-xs font-semibold text-white/85 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                  >
                    <Plus size={14} className="text-netflix-gray" />
                    My List ({watchlist.length})
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-red hover:bg-brand-red/10 rounded-md transition-colors w-full text-left border-t border-white/5 mt-1"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/auth"
            className="bg-brand-red hover:bg-brand-red-hover text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full transition-transform active:scale-95 duration-200"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
