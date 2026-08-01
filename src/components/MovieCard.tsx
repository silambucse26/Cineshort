'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import MovieImage from './MovieImage';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Plus, Check, Heart, Info, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Movie } from '../types';
import { getImageUrl } from '../services/tmdb';
import { useUserActions } from '../context/UserActionsContext';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const router = useRouter();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isFavorite, addToFavorites, removeFromFavorites } = useUserActions();
  const [isHovered, setIsHovered] = useState(false);

  const inWatchlist = isInWatchlist(movie.id);
  const favorite = isFavorite(movie.id);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie.id);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie.id);
    }
  };



  return (
    <>
      <motion.div
        onClick={() => router.push(`/movie/${movie.id}`)}
        className="relative flex-none w-[180px] sm:w-[220px] md:w-[250px] aspect-[2/3] rounded-lg overflow-hidden cursor-pointer group bg-netflix-card border border-white/5 shadow-lg select-none"
        whileHover={{ 
          scale: 1.06, 
          y: -8,
          borderColor: 'rgba(229, 9, 20, 0.4)'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Movie Poster Image */}
        <div className="relative w-full h-full">
          <MovieImage
            path={movie.posterPath}
            title={movie.title}
            releaseYear={movie.releaseYear}
            genres={movie.genres}
            fallbackType="poster"
            size="w500"
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, 250px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
          
          {/* Subtle rating badge on top right */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-amber-400 border border-white/10">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span>{movie.rating}</span>
          </div>
        </div>

        {/* Hover Overlay Layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
          <h3 className="text-white font-bold text-sm sm:text-base md:text-lg tracking-wide line-clamp-1 mb-1">
            {movie.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-netflix-gray font-semibold mb-2">
            <span>{movie.releaseYear}</span>
            <span>•</span>
            <span>{movie.runtime}</span>
            <span>•</span>
            <span className="bg-white/15 px-1 rounded text-[10px] text-white">
              {movie.languages[0]}
            </span>
          </div>

          <div className="text-[11px] text-netflix-gray line-clamp-2 mb-3 leading-relaxed">
            {movie.overview}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
               {/* Play / Trailer button */}
              <Link href={`/watch/${movie.id}`} onClick={(e) => e.stopPropagation()} passHref>
                <span
                  className="p-2 bg-brand-red hover:bg-brand-red-hover text-white rounded-full transition-transform active:scale-90 block"
                  title="Watch Trailer"
                >
                  <Play size={16} className="fill-white" />
                </span>
              </Link>

              {/* Watchlist toggle */}
              <button
                onClick={handleWatchlistClick}
                className={`p-2 rounded-full border transition-all duration-200 active:scale-90 ${
                  inWatchlist 
                    ? 'border-brand-red text-brand-red bg-brand-red/10' 
                    : 'border-white/40 text-white hover:border-white hover:bg-white/10'
                }`}
                title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                {inWatchlist ? <Check size={16} /> : <Plus size={16} />}
              </button>

              {/* Favorite toggle */}
              <button
                onClick={handleFavoriteClick}
                className={`p-2 rounded-full border transition-all duration-200 active:scale-90 ${
                  favorite 
                    ? 'border-pink-500 text-pink-500 bg-pink-500/10' 
                    : 'border-white/40 text-white hover:border-white hover:bg-white/10'
                }`}
                title={favorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart size={16} className={favorite ? "fill-pink-500" : ""} />
              </button>
            </div>

            {/* Info / Details Button */}
            <Link href={`/movie/${movie.id}`} onClick={(e) => e.stopPropagation()} passHref>
              <span className="p-2 rounded-full border border-white/40 text-white hover:border-white hover:bg-white/10 transition-colors active:scale-90 block">
                <Info size={16} />
              </span>
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
};
export default MovieCard;
