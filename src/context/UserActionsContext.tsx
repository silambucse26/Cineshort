'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Review, ContinueWatchItem } from '../types';

interface UserActionsContextType {
  watchlist: string[];
  favorites: string[];
  continueWatching: ContinueWatchItem[];
  ratings: Record<string, number>;
  reviews: Record<string, Review[]>;
  adminFeaturedBannerId: string;
  adminCategories: Record<string, string[]>;
  
  // Watchlist Actions
  addToWatchlist: (movieId: string) => void;
  removeFromWatchlist: (movieId: string) => void;
  isInWatchlist: (movieId: string) => boolean;
  
  // Favorite Actions
  addToFavorites: (movieId: string) => void;
  removeFromFavorites: (movieId: string) => void;
  isFavorite: (movieId: string) => boolean;

  // Continue Watching Actions
  updateWatchProgress: (movieId: string, progress: number) => void;
  removeFromContinueWatching: (movieId: string) => void;

  // Rating & Review Actions
  rateMovie: (movieId: string, rating: number) => void;
  submitReview: (movieId: string, content: string, rating: number) => void;
  getMovieReviews: (movieId: string) => Review[];
  deleteReview: (movieId: string, reviewId: string) => void;

  // Admin Actions
  setFeaturedBanner: (movieId: string) => void;
  updateCategoryMovies: (category: string, movieIds: string[]) => void;
}

const UserActionsContext = createContext<UserActionsContextType | undefined>(undefined);

export const UserActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchItem[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  
  // Admin configurations
  const [adminFeaturedBannerId, setAdminFeaturedBannerId] = useState<string>("sam-story"); // default featured: Sam Story
  const [adminCategories, setAdminCategories] = useState<Record<string, string[]>>({
    "Editor's Picks": ["sam-story", "eng-1", "eng-3", "tam-3", "tel-1", "mal-1"],
    "Recommended For You": ["sam-story", "eng-4", "tam-1", "tel-3", "mal-3", "kan-1"]
  });

  // Unique storage keys based on user login
  const getStorageKey = (prefix: string) => {
    return user ? `${prefix}_${user.id}` : `${prefix}_guest`;
  };

  // Load user data on auth change
  useEffect(() => {
    const keyWatchlist = getStorageKey('streamix_watchlist');
    const keyFavorites = getStorageKey('streamix_favorites');
    const keyContinue = getStorageKey('streamix_continue');
    const keyRatings = getStorageKey('streamix_ratings');
    
    // Load from local storage
    setWatchlist(JSON.parse(localStorage.getItem(keyWatchlist) || '[]'));
    setFavorites(JSON.parse(localStorage.getItem(keyFavorites) || '[]'));
    setContinueWatching(JSON.parse(localStorage.getItem(keyContinue) || '[]'));
    setRatings(JSON.parse(localStorage.getItem(keyRatings) || '{}'));
    
    // Global reviews load
    const storedReviews = localStorage.getItem('streamix_global_reviews');
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    } else {
      // Default reviews pre-population
      const defaultReviews: Record<string, Review[]> = {
        "eng-1": [
          { id: "rev-1", author: "CinePhile99", content: "Christopher Nolan's masterpiece. The screenplay is exceptionally tight and the visuals are mind-bending.", rating: 10, date: "2026-05-12" },
          { id: "rev-2", author: "MovieBuff", content: "Great acting by Leo DiCaprio. A truly original sci-fi concept that holds up extremely well.", rating: 9, date: "2026-06-01" }
        ],
        "eng-2": [
          { id: "rev-3", author: "SpaceExplorer", content: "No movie has captured the loneliness and grandeur of space better than Interstellar. Hans Zimmer's organ soundtrack is legendary.", rating: 10, date: "2026-07-02" }
        ],
        "tam-1": [
          { id: "rev-4", author: "KollywoodFan", content: "Lokesh Kanagaraj delivers an explosive action entertainer. Vijay's performance is stylish and powerful.", rating: 8, date: "2026-02-15" }
        ]
      };
      setReviews(defaultReviews);
      localStorage.setItem('streamix_global_reviews', JSON.stringify(defaultReviews));
    }
    
    // Load admin panel configs
    const storedBanner = localStorage.getItem('streamix_admin_featured_banner');
    if (storedBanner) setAdminFeaturedBannerId(storedBanner);

    const storedCats = localStorage.getItem('streamix_admin_categories');
    if (storedCats) setAdminCategories(JSON.parse(storedCats));
  }, [user]);

  // Synchronize helper
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(getStorageKey(key), JSON.stringify(data));
  };

  // Watchlist functions
  const addToWatchlist = (movieId: string) => {
    const updated = [...watchlist.filter(id => id !== movieId), movieId];
    setWatchlist(updated);
    saveToStorage('streamix_watchlist', updated);
  };

  const removeFromWatchlist = (movieId: string) => {
    const updated = watchlist.filter(id => id !== movieId);
    setWatchlist(updated);
    saveToStorage('streamix_watchlist', updated);
  };

  const isInWatchlist = (movieId: string) => {
    return watchlist.includes(movieId);
  };

  // Favorites functions
  const addToFavorites = (movieId: string) => {
    const updated = [...favorites.filter(id => id !== movieId), movieId];
    setFavorites(updated);
    saveToStorage('streamix_favorites', updated);
  };

  const removeFromFavorites = (movieId: string) => {
    const updated = favorites.filter(id => id !== movieId);
    setFavorites(updated);
    saveToStorage('streamix_favorites', updated);
  };

  const isFavorite = (movieId: string) => {
    return favorites.includes(movieId);
  };

  // Continue Watching functions
  const updateWatchProgress = (movieId: string, progress: number) => {
    const freshItem: ContinueWatchItem = {
      id: `cw-${movieId}`,
      movieId,
      progress,
      updatedAt: new Date().toISOString()
    };
    const filtered = continueWatching.filter(item => item.movieId !== movieId);
    const updated = [freshItem, ...filtered].slice(0, 10); // cap at 10 items
    setContinueWatching(updated);
    saveToStorage('streamix_continue', updated);
  };

  const removeFromContinueWatching = (movieId: string) => {
    const updated = continueWatching.filter(item => item.movieId !== movieId);
    setContinueWatching(updated);
    saveToStorage('streamix_continue', updated);
  };

  // Ratings functions
  const rateMovie = (movieId: string, rating: number) => {
    const updated = { ...ratings, [movieId]: rating };
    setRatings(updated);
    saveToStorage('streamix_ratings', updated);
  };

  // Reviews functions
  const submitReview = (movieId: string, content: string, rating: number) => {
    const authorName = user ? user.username : 'Anonymous Guest';
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: authorName,
      content,
      rating,
      date: new Date().toISOString().split('T')[0]
    };

    const currentMovieReviews = reviews[movieId] || [];
    const updatedMovieReviews = [newReview, ...currentMovieReviews];
    const updatedReviews = { ...reviews, [movieId]: updatedMovieReviews };
    
    setReviews(updatedReviews);
    localStorage.setItem('streamix_global_reviews', JSON.stringify(updatedReviews));

    // Automatically record rating too
    rateMovie(movieId, rating);
  };

  const getMovieReviews = (movieId: string) => {
    return reviews[movieId] || [];
  };

  const deleteReview = (movieId: string, reviewId: string) => {
    const current = reviews[movieId] || [];
    const updatedMovieReviews = current.filter(r => r.id !== reviewId);
    const updatedReviews = { ...reviews, [movieId]: updatedMovieReviews };
    
    setReviews(updatedReviews);
    localStorage.setItem('streamix_global_reviews', JSON.stringify(updatedReviews));
  };

  // Admin functions
  const setFeaturedBanner = (movieId: string) => {
    setAdminFeaturedBannerId(movieId);
    localStorage.setItem('streamix_admin_featured_banner', movieId);
  };

  const updateCategoryMovies = (category: string, movieIds: string[]) => {
    const updated = { ...adminCategories, [category]: movieIds };
    setAdminCategories(updated);
    localStorage.setItem('streamix_admin_categories', JSON.stringify(updated));
  };

  return (
    <UserActionsContext.Provider
      value={{
        watchlist,
        favorites,
        continueWatching,
        ratings,
        reviews,
        adminFeaturedBannerId,
        adminCategories,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        updateWatchProgress,
        removeFromContinueWatching,
        rateMovie,
        submitReview,
        getMovieReviews,
        deleteReview,
        setFeaturedBanner,
        updateCategoryMovies
      }}
    >
      {children}
    </UserActionsContext.Provider>
  );
};

export const useUserActions = () => {
  const context = useContext(UserActionsContext);
  if (context === undefined) {
    throw new Error('useUserActions must be used within a UserActionsProvider');
  }
  return context;
};
