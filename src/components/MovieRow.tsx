'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

export const MovieRow: React.FC<MovieRowProps> = ({ title, movies }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const rowEl = rowRef.current;
    if (rowEl) {
      rowEl.addEventListener('scroll', checkScroll);
      // Run once initially to check boundaries
      checkScroll();
      
      // Also listen to window resize
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (rowEl) {
        rowEl.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [movies]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { clientWidth, scrollLeft } = rowRef.current;
      // Scroll by 70% of the visible container width
      const scrollAmount = clientWidth * 0.75;
      const targetScroll = 
        direction === 'left' 
          ? scrollLeft - scrollAmount 
          : scrollLeft + scrollAmount;
          
      rowRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  if (!movies || movies.length === 0) {
    return null; // hide row if empty
  }

  return (
    <div className="relative flex flex-col space-y-2 md:space-y-4 my-6 px-4 md:px-8 group">
      {/* Title */}
      <h2 className="text-white text-base sm:text-lg md:text-xl font-bold tracking-wider hover:text-brand-red transition-colors duration-200 cursor-pointer inline-flex items-center gap-1">
        {title}
      </h2>

      {/* Row Container */}
      <div className="relative">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute top-0 bottom-0 left-0 z-30 flex items-center justify-center w-12 bg-black/60 hover:bg-black/85 text-white/80 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 border-r border-white/5 backdrop-blur-sm rounded-l-md"
            aria-label="Scroll left"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        {/* Horizontal Card Slider */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden py-4 px-1 scroll-smooth no-scrollbar"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute top-0 bottom-0 right-0 z-30 flex items-center justify-center w-12 bg-black/60 hover:bg-black/85 text-white/80 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 border-l border-white/5 backdrop-blur-sm rounded-r-md"
            aria-label="Scroll right"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>
    </div>
  );
};
export default MovieRow;
