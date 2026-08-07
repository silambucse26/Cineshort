'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Star, Clock, User, Bookmark } from 'lucide-react';
import { ShortFilm } from '../types/shortfilm';
import { formatDuration } from '../services/driveService';
import { useShortFilm } from '../context/ShortFilmContext';

interface FilmCardProps {
  film: ShortFilm;
  compact?: boolean;
}

export const FilmCard: React.FC<FilmCardProps> = ({ film, compact = false }) => {
  const { toggleWishlist, isInWishlist } = useShortFilm();
  const saved = isInWishlist(film.id);

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-[#1F2833]/40 border border-white/10 hover:border-[#FFD60A]/50 shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-all duration-300 flex flex-col justify-between select-none">
      {/* Poster Media Box (Netflix-style compact Card) */}
      <div className="relative aspect-[4/5] sm:aspect-video w-full bg-[#0B0C10] overflow-hidden">
        <img
          src={film.thumbnail_url}
          alt={film.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Mask for Mobile Netflix Card readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

        {/* Top Overlay Badges: Rating (Left) & Bookmark (Right) */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          {/* Rating Badge Pill matching Screenshot 1 */}
          <span className="bg-black/70 backdrop-blur-md border border-[#FFD60A]/40 text-[#FFD60A] text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
            <Star className="w-3 h-3 fill-current text-[#FFD60A]" />
            <span>{film.rating_avg.toFixed(1)}</span>
          </span>

          {/* Bookmark Wishlist Button matching Screenshot 1 */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(film.id);
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
              saved
                ? 'bg-red-600/90 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                : 'bg-black/70 text-gray-300 border-white/10 hover:text-white hover:border-white/40'
            }`}
            title={saved ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Hover Play Action Overlay */}
        <Link
          href={`/film/${film.id}`}
          className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]"
        >
          <div className="w-11 h-11 rounded-full bg-[#FFD60A] text-[#0B0C10] flex items-center justify-center pl-0.5 shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-current" />
          </div>
        </Link>

        {/* Bottom Thumbnail Overlay Info matching Screenshot 1 */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-10 flex flex-col items-start gap-1 pointer-events-none">
          {/* Mood Genre Tag Pill */}
          <span className="bg-[#FFD60A] text-[#0B0C10] font-black text-[9px] uppercase px-2 py-0.5 rounded-md tracking-wider shadow">
            {film.mood_tag}
          </span>

          {/* Title */}
          <Link 
            href={`/film/${film.id}`} 
            className="pointer-events-auto block group-hover:text-[#FFD60A] transition-colors"
          >
            <h3 className="font-extrabold text-xs sm:text-sm text-white line-clamp-1 drop-shadow-sm">
              {film.title}
            </h3>
          </Link>

          {/* Duration & Creator Info Subtitle */}
          <div className="text-[10px] text-gray-300 font-semibold flex items-center gap-1.5 truncate w-full">
            <span>{formatDuration(film.duration_sec)}</span>
            <span>•</span>
            <span className="truncate">{film.director_name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
