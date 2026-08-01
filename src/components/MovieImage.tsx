'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { getImageUrl } from '../services/tmdb';

interface MovieImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  path: string | null | undefined;
  title: string;
  releaseYear?: string;
  size?: 'w300' | 'w500' | 'original';
  fallbackType?: 'poster' | 'backdrop';
  genres?: string[];
}

// Memory and localStorage cache to avoid repeated Wikipedia API hits
const wikipediaCache: Record<string, string> = {};

export const MovieImage: React.FC<MovieImageProps> = ({
  path,
  title,
  releaseYear,
  size = 'w500',
  fallbackType = 'poster',
  genres = [],
  alt,
  className,
  ...props
}) => {
  const [src, setSrc] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [loadingFallback, setLoadingFallback] = useState<boolean>(false);

  useEffect(() => {
    // Reset state and try loading initial image path
    setSrc(getImageUrl(path, size));
    setHasError(false);
    setLoadingFallback(false);
  }, [path, size]);

  const getUnsplashFallback = (): string => {
    const isBackdrop = fallbackType === 'backdrop';
    const primaryGenre = genres[0] || '';
    const lowerGenre = primaryGenre.toLowerCase();

    // Sci-Fi / Space / Fantasy
    if (
      lowerGenre.includes('sci-fi') || 
      lowerGenre.includes('space') || 
      lowerGenre.includes('fantasy') ||
      title.toLowerCase() === 'inception' ||
      title.toLowerCase() === 'interstellar' ||
      title.toLowerCase() === 'kalki 2898 ad' ||
      title.toLowerCase() === 'dune: part two' ||
      title.toLowerCase() === 'baahubali: the beginning'
    ) {
      return isBackdrop 
        ? 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1000'
        : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=500';
    }
    
    // Action / Crime / Thriller
    if (
      lowerGenre.includes('action') || 
      lowerGenre.includes('crime') || 
      lowerGenre.includes('thriller') ||
      title.toLowerCase() === 'leo' ||
      title.toLowerCase() === 'vikram' ||
      title.toLowerCase() === 'kaithi' ||
      title.toLowerCase() === 'pushpa: the rise' ||
      title.toLowerCase() === 'pushpa 2: the rule' ||
      title.toLowerCase() === 'k.g.f: chapter 1' ||
      title.toLowerCase() === 'k.g.f: chapter 2' ||
      title.toLowerCase() === 'jailer' ||
      title.toLowerCase() === 'jawan' ||
      title.toLowerCase() === 'pathaan' ||
      title.toLowerCase() === 'animal' ||
      title.toLowerCase() === 'the dark knight'
    ) {
      return isBackdrop
        ? 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000'
        : 'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?q=80&w=500';
    }

    // Drama / Romance / Comedy / Family
    if (
      lowerGenre.includes('drama') || 
      lowerGenre.includes('romance') || 
      lowerGenre.includes('comedy') || 
      lowerGenre.includes('family') ||
      title.toLowerCase() === '3 idiots' ||
      title.toLowerCase() === 'dangal' ||
      title.toLowerCase() === 'soorarai pottru' ||
      title.toLowerCase() === 'oppenheimer'
    ) {
      return isBackdrop
        ? 'https://images.unsplash.com/photo-1492446845049-9c50cc313f00?q=80&w=1000'
        : 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=500';
    }

    // Suspense / Horror
    if (
      lowerGenre.includes('horror') || 
      lowerGenre.includes('suspense') || 
      title.toLowerCase() === 'bramayugam' ||
      title.toLowerCase() === 'drishyam' ||
      title.toLowerCase() === 'manjummel boys' ||
      title.toLowerCase() === 'premalu'
    ) {
      return isBackdrop
        ? 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=1000'
        : 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=500';
    }

    // General Cinema fallbacks
    return isBackdrop
      ? 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000'
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500';
  };

  const handleFallback = async () => {
    // If we already failed once and are loading the fallback, prevent infinite loops
    if (hasError) return;
    setHasError(true);
    setLoadingFallback(true);

    // Backdrops always fall back to beautiful Unsplash scenes immediately
    if (fallbackType === 'backdrop') {
      setSrc(getUnsplashFallback());
      setLoadingFallback(false);
      return;
    }

    // Try finding Wikipedia poster image for posters
    const cacheKey = `${title}_${releaseYear || ''}`.toLowerCase().trim();
    
    // Check memory cache
    if (wikipediaCache[cacheKey]) {
      setSrc(wikipediaCache[cacheKey]);
      setLoadingFallback(false);
      return;
    }

    // Check localStorage cache
    try {
      const stored = localStorage.getItem(`wp_poster_${cacheKey}`);
      if (stored) {
        wikipediaCache[cacheKey] = stored;
        setSrc(stored);
        setLoadingFallback(false);
        return;
      }
    } catch (_) {}

    // Fetch from Wikipedia API in browser
    try {
      // Setup queries to search Wikipedia
      const searchQueries = [
        `${title} (film)`,
        `${title} (${releaseYear} film)`,
        `${title} (Indian film)`,
        title
      ];

      let foundUrl = '';

      for (const query of searchQueries) {
        const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(query)}&redirects=1&origin=*`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const pages = data.query?.pages;
          if (pages) {
            const pageId = Object.keys(pages)[0];
            if (pageId && pageId !== '-1') {
              const source = pages[pageId].original?.source;
              if (source && source.startsWith('http')) {
                foundUrl = source;
                break;
              }
            }
          }
        }
      }

      if (foundUrl) {
        // Cache it
        wikipediaCache[cacheKey] = foundUrl;
        try {
          localStorage.setItem(`wp_poster_${cacheKey}`, foundUrl);
        } catch (_) {}
        
        setSrc(foundUrl);
      } else {
        // Fall back to Unsplash
        setSrc(getUnsplashFallback());
      }
    } catch (err) {
      console.error("Failed to retrieve poster from Wikipedia API:", err);
      setSrc(getUnsplashFallback());
    } finally {
      setLoadingFallback(false);
    }
  };

  return (
    <Image
      {...props}
      src={src || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxMTEiLz48L3N2Zz4='}
      alt={alt || title}
      onError={handleFallback}
      className={className}
    />
  );
};

export default MovieImage;
