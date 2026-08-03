'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Star, Clock, User, Heart, Bookmark } from 'lucide-react';
import { ShortFilm } from '../types/shortfilm';
import { formatDuration } from '../services/driveService';
import { useShortFilm } from '../context/ShortFilmContext';

interface FilmCardProps {
  film: ShortFilm;
}

export const FilmCard: React.FC<FilmCardProps> = ({ film }) => {
  const { toggleWishlist, isInWishlist } = useShortFilm();
  const saved = isInWishlist(film.id);

  return (
    <div className="card-flat overflow-hidden group flex flex-col justify-between hover:border-[#F4A300]/50 transition-all duration-300">
      {/* Thumbnail Container */}
      <div className="relative aspect-video bg-[#0B0C10] overflow-hidden">
        <img
          src={film.thumbnail_url}
          alt={film.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="tag-red font-bold text-[10px] uppercase shadow-md">
            {film.mood_tag}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(film.id);
            }}
            className={`p-1.5 rounded-md backdrop-blur-md border transition-all ${
              saved
                ? 'bg-red-600/90 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                : 'bg-[#0B0C10]/80 text-gray-300 border-white/10 hover:text-white hover:bg-black'
            }`}
            title={saved ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
          </button>

          <span className="bg-[#0B0C10]/85 text-[#F5F5F5] font-semibold text-[11px] px-2 py-1 rounded-md border border-white/10 flex items-center gap-1 backdrop-blur-sm">
            <Clock className="w-3 h-3 text-[#F4A300]" />
            {formatDuration(film.duration_sec)}
          </span>
        </div>

        {/* Hover Play Icon Overlay */}
        <Link
          href={`/film/${film.id}`}
          className="absolute inset-0 bg-[#0B0C10]/40 group-hover:bg-[#0B0C10]/20 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-12 h-12 rounded-full bg-[#FFD60A] text-[#0B0C10] flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-current" />
          </div>
        </Link>
      </div>

      {/* Card Details */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <Link href={`/film/${film.id}`} className="block group-hover:text-[#FFD60A] transition-colors">
            <h3 className="font-bold text-base text-[#F5F5F5] line-clamp-1 mb-1">
              {film.title}
            </h3>
          </Link>

          <Link
            href={`/director/${film.director_id}`}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#F4A300] transition-colors mb-3"
          >
            <User className="w-3.5 h-3.5" />
            <span className="font-medium">{film.director_name}</span>
          </Link>
        </div>

        {/* Footer info: Rating Stars + Hero Tag */}
        <div className="pt-2 border-t border-gray-700/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[#F4A300] font-bold">
            <Star className="w-4 h-4 fill-current" />
            <span>{film.rating_avg.toFixed(1)}</span>
            <span className="text-[10px] text-gray-400 font-normal">({film.rating_count})</span>
          </div>

          {film.hero_names.length > 0 && (
            <span className="text-[11px] text-gray-400 truncate max-w-[120px]">
              Cast: <span className="text-gray-200">{film.hero_names[0]}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

