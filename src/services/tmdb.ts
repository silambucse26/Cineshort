import { Movie, CastMember, CrewMember } from '../types';
import { MOCK_MOVIES } from '../mockData/movies';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Helper to check if TMDB is configured
export const isLiveMode = (): boolean => {
  return !!TMDB_API_KEY;
};

// Map TMDB response structure to our clean Movie schema
const mapTMDbMovie = async (tmdbMovie: any): Promise<Movie> => {
  const movieId = tmdbMovie.id.toString();

  // If we have API key, fetch additional details (like runtime, cast, crew, videos, etc.)
  let runtime = "120 min";
  let budget = "N/A";
  let revenue = "N/A";
  let officialWebsite = "";
  let cast: CastMember[] = [];
  let crew: CrewMember[] = [];
  let youtubeKey = "";
  let screenshots: string[] = [];
  let productionCompanies: string[] = [];

  try {
    // Fetch details
    const detailsRes = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,images`);
    if (detailsRes.ok) {
      const details = await detailsRes.json();
      
      // Calculate runtime format (e.g. 2h 15m)
      if (details.runtime) {
        const hrs = Math.floor(details.runtime / 60);
        const mins = details.runtime % 60;
        runtime = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
      }
      
      budget = details.budget ? `$${details.budget.toLocaleString()}` : "N/A";
      revenue = details.revenue ? `$${details.revenue.toLocaleString()}` : "N/A";
      officialWebsite = details.homepage || "";
      
      // Cast (top 6)
      if (details.credits && details.credits.cast) {
        cast = details.credits.cast.slice(0, 6).map((c: any) => ({
          name: c.name,
          character: c.character,
          profilePath: c.profile_path ? `${c.profile_path}` : undefined
        }));
      }

      // Crew (Director, Writers, Producers)
      if (details.credits && details.credits.crew) {
        crew = details.credits.crew
          .filter((cr: any) => ["Director", "Writer", "Producer", "Screenplay"].includes(cr.job))
          .map((cr: any) => ({
            name: cr.name,
            job: cr.job,
            profilePath: cr.profile_path ? `${cr.profile_path}` : undefined
          }));
      }

      // Find YouTube trailer key
      if (details.videos && details.videos.results) {
        const trailer = details.videos.results.find(
          (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
        ) || details.videos.results.find((v: any) => v.site === "YouTube");
        
        youtubeKey = trailer ? trailer.key : "";
      }

      // Screenshots (backdrops)
      if (details.images && details.images.backdrops) {
        screenshots = details.images.backdrops.slice(0, 5).map((img: any) => img.file_path);
      }

      // Production companies
      if (details.production_companies) {
        productionCompanies = details.production_companies.map((pc: any) => pc.name);
      }
    }
  } catch (error) {
    console.error("Error fetching extra details from TMDB:", error);
  }

  // Fallbacks if some properties aren't fetched
  return {
    id: movieId,
    title: tmdbMovie.title,
    backdropPath: tmdbMovie.backdrop_path || "",
    posterPath: tmdbMovie.poster_path || "",
    overview: tmdbMovie.overview || "No overview available.",
    releaseYear: tmdbMovie.release_date ? tmdbMovie.release_date.split('-')[0] : "N/A",
    releaseDate: tmdbMovie.release_date || "",
    runtime,
    rating: Number((tmdbMovie.vote_average || 0).toFixed(1)),
    popularity: tmdbMovie.popularity || 0,
    genres: tmdbMovie.genre_ids ? getGenresFromIds(tmdbMovie.genre_ids) : [],
    languages: tmdbMovie.original_language ? [mapLanguageCode(tmdbMovie.original_language)] : ["English"],
    cast,
    crew,
    budget,
    revenue,
    officialWebsite,
    youtubeKey: youtubeKey || "dQw4w9WgXcQ", // fallback to Rick Astley if none
    screenshots,
    productionCompanies,
    status: tmdbMovie.status || "Released"
  };
};

// Genre mapping dictionary
const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

const getGenresFromIds = (ids: number[]): string[] => {
  return ids.map(id => GENRE_MAP[id] || "").filter(name => name !== "");
};

const mapLanguageCode = (code: string): string => {
  const langMap: Record<string, string> = {
    en: "English", ta: "Tamil", te: "Telugu", hi: "Hindi", ml: "Malayalam", kn: "Kannada",
    es: "Spanish", fr: "French", ja: "Japanese", ko: "Korean"
  };
  return langMap[code] || "English";
};

// Service Functions
export const getTrendingMovies = async (): Promise<Movie[]> => {
  if (isLiveMode()) {
    try {
      const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
      if (res.ok) {
        const data = await res.json();
        const movies = await Promise.all(data.results.slice(0, 10).map((m: any) => mapTMDbMovie(m)));
        return movies;
      }
    } catch (e) {
      console.error("Failed to fetch live trending, falling back", e);
    }
  }
  
  // Demo Mode: return top rated/highest rating mock movies
  return [...MOCK_MOVIES].sort((a, b) => b.popularity - a.popularity).slice(0, 10);
};

export const getPopularMovies = async (): Promise<Movie[]> => {
  if (isLiveMode()) {
    try {
      const res = await fetch(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
      if (res.ok) {
        const data = await res.json();
        const movies = await Promise.all(data.results.slice(0, 10).map((m: any) => mapTMDbMovie(m)));
        return movies;
      }
    } catch (e) {
      console.error("Failed to fetch live popular, falling back", e);
    }
  }
  return [...MOCK_MOVIES].sort((a, b) => b.rating - a.rating).slice(0, 10);
};

export const getTopRatedMovies = async (): Promise<Movie[]> => {
  if (isLiveMode()) {
    try {
      const res = await fetch(`${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`);
      if (res.ok) {
        const data = await res.json();
        const movies = await Promise.all(data.results.slice(0, 10).map((m: any) => mapTMDbMovie(m)));
        return movies;
      }
    } catch (e) {
      console.error("Failed to fetch live top rated, falling back", e);
    }
  }
  return [...MOCK_MOVIES].filter(m => m.rating >= 8.3).slice(0, 10);
};

export const getNewReleases = async (): Promise<Movie[]> => {
  if (isLiveMode()) {
    try {
      const res = await fetch(`${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}`);
      if (res.ok) {
        const data = await res.json();
        const movies = await Promise.all(data.results.slice(0, 10).map((m: any) => mapTMDbMovie(m)));
        return movies;
      }
    } catch (e) {
      console.error("Failed to fetch live new releases, falling back", e);
    }
  }
  return [...MOCK_MOVIES].filter(m => m.releaseYear === "2024").slice(0, 10);
};

export const getMoviesByGenre = async (genreName: string): Promise<Movie[]> => {
  if (isLiveMode()) {
    try {
      // Find genre ID
      const genreIdMap: Record<string, number> = {
        "Action": 28, "Adventure": 12, "Animation": 16, "Comedy": 35, "Crime": 80,
        "Documentary": 99, "Drama": 18, "Family": 10751, "Fantasy": 14, "Horror": 27,
        "Romance": 10749, "Sci-Fi": 878, "Thriller": 53
      };
      const genreId = genreIdMap[genreName];
      if (genreId) {
        const res = await fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}`);
        if (res.ok) {
          const data = await res.json();
          const movies = await Promise.all(data.results.slice(0, 10).map((m: any) => mapTMDbMovie(m)));
          return movies;
        }
      }
    } catch (e) {
      console.error("Failed to discover live movies by genre, falling back", e);
    }
  }
  return MOCK_MOVIES.filter(m => m.genres.some(g => g.toLowerCase() === genreName.toLowerCase())).slice(0, 10);
};

export const getMoviesByLanguage = async (langName: string): Promise<Movie[]> => {
  if (isLiveMode()) {
    try {
      const langCodeMap: Record<string, string> = {
        "English": "en", "Tamil": "ta", "Telugu": "te", "Hindi": "hi", "Malayalam": "ml", "Kannada": "kn"
      };
      const code = langCodeMap[langName];
      if (code) {
        const res = await fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=${code}&sort_by=popularity.desc`);
        if (res.ok) {
          const data = await res.json();
          const movies = await Promise.all(data.results.slice(0, 10).map((m: any) => mapTMDbMovie(m)));
          return movies;
        }
      }
    } catch (e) {
      console.error("Failed to discover live movies by language, falling back", e);
    }
  }
  return MOCK_MOVIES.filter(m => m.languages.some(l => l.toLowerCase() === langName.toLowerCase())).slice(0, 10);
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
  // If it's a mock ID (e.g. "eng-1" or starts with custom prefixes), resolve from mock data first
  const mockMovie = MOCK_MOVIES.find(m => m.id === id);
  if (mockMovie) {
    return mockMovie;
  }

  // If it's a numeric ID and live mode is on, query TMDB
  if (isLiveMode() && !isNaN(Number(id))) {
    try {
      const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`);
      if (res.ok) {
        const raw = await res.json();
        const mapped = await mapTMDbMovie(raw);
        
        // Fetch recommendations and append them as similar IDs
        const recRes = await fetch(`${BASE_URL}/movie/${id}/recommendations?api_key=${TMDB_API_KEY}`);
        if (recRes.ok) {
          const recData = await recRes.json();
          mapped.similarIds = recData.results.slice(0, 6).map((r: any) => r.id.toString());
        }
        
        return mapped;
      }
    } catch (e) {
      console.error("Failed to fetch live movie detail", e);
    }
  }

  return null;
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  if (!query || query.trim() === '') return [];

  if (isLiveMode()) {
    try {
      const res = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const movies = await Promise.all(data.results.slice(0, 10).map((m: any) => mapTMDbMovie(m)));
        return movies;
      }
    } catch (e) {
      console.error("Failed to search live movies, falling back", e);
    }
  }

  // Fallback / Demo search
  const lowerQuery = query.toLowerCase();
  return MOCK_MOVIES.filter(m => 
    m.title.toLowerCase().includes(lowerQuery) ||
    m.overview.toLowerCase().includes(lowerQuery) ||
    m.genres.some(g => g.toLowerCase().includes(lowerQuery)) ||
    m.languages.some(l => l.toLowerCase().includes(lowerQuery)) ||
    m.cast.some(c => c.name.toLowerCase().includes(lowerQuery)) ||
    m.crew.some(cr => cr.name.toLowerCase().includes(lowerQuery))
  );
};

// Fetch recommendations/similar movies
export const getSimilarMovies = async (movie: Movie): Promise<Movie[]> => {
  if (movie.similarIds && movie.similarIds.length > 0) {
    const list: Movie[] = [];
    for (const id of movie.similarIds) {
      const item = await getMovieById(id);
      if (item) list.push(item);
    }
    if (list.length > 0) return list;
  }

  if (isLiveMode() && !isNaN(Number(movie.id))) {
    try {
      const res = await fetch(`${BASE_URL}/movie/${movie.id}/similar?api_key=${TMDB_API_KEY}`);
      if (res.ok) {
        const data = await res.json();
        const movies = await Promise.all(data.results.slice(0, 6).map((m: any) => mapTMDbMovie(m)));
        return movies;
      }
    } catch (e) {
      console.error("Failed to get similar live movies", e);
    }
  }

  // Fallback: match by sharing at least one genre or same language
  return MOCK_MOVIES.filter(m => 
    m.id !== movie.id && 
    (m.genres.some(g => movie.genres.includes(g)) || m.languages[0] === movie.languages[0])
  ).slice(0, 6);
};

// Prepend image URL path helper
export const getImageUrl = (path: string | null | undefined, size: 'w300' | 'w500' | 'original' = 'w500'): string => {
  if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500'; // fallback movie board
  if (path.startsWith('http')) return path;

  // Detect mock filenames in the demo movies list (e.g. kalkiPoster.jpg, rrrBackdrop.jpg)
  const lowerPath = path.toLowerCase();
  const isMock = !path.startsWith('/') || 
                 lowerPath.includes('poster') || 
                 lowerPath.includes('backdrop') ||
                 lowerPath.includes('threeidiots') ||
                 lowerPath.includes('charlie') ||
                 lowerPath.includes('drishyam') ||
                 lowerPath.includes('premalu') ||
                 lowerPath.includes('bramayugam') ||
                 lowerPath.includes('manjummel') ||
                 lowerPath.includes('jawan') ||
                 lowerPath.includes('animal') ||
                 lowerPath.includes('pathaan') ||
                 lowerPath.includes('pushpa') ||
                 lowerPath.includes('baahubali') ||
                 lowerPath.includes('kalki') ||
                 lowerPath.includes('kgf') ||
                 lowerPath.includes('sp') ||
                 lowerPath.includes('kaithi') ||
                 lowerPath.includes('urrr');

  if (isMock) {
    const isBackdrop = lowerPath.includes('backdrop') || size === 'original';

    // Sci-Fi / Space / Fantasy
    if (lowerPath.includes('space') || lowerPath.includes('inception') || lowerPath.includes('interstellar') || lowerPath.includes('kalki') || lowerPath.includes('dune') || lowerPath.includes('baahubali')) {
      return isBackdrop 
        ? 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1000'
        : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=500';
    }
    
    // Action / Crime / Thriller
    if (lowerPath.includes('action') || lowerPath.includes('leo') || lowerPath.includes('vikram') || lowerPath.includes('kaithi') || lowerPath.includes('pushpa') || lowerPath.includes('kgf') || lowerPath.includes('jailer') || lowerPath.includes('jawan') || lowerPath.includes('pathaan') || lowerPath.includes('animal') || lowerPath.includes('dark')) {
      return isBackdrop
        ? 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000'
        : 'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?q=80&w=500';
    }

    // Drama / Romance / Biographical
    if (lowerPath.includes('drama') || lowerPath.includes('romance') || lowerPath.includes('arjun') || lowerPath.includes('dangal') || lowerPath.includes('soorarai') || lowerPath.includes('sp') || lowerPath.includes('threeidiots') || lowerPath.includes('oppenheimer') || lowerPath.includes('urrr')) {
      return isBackdrop
        ? 'https://images.unsplash.com/photo-1492446845049-9c50cc313f00?q=80&w=1000'
        : 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=500';
    }

    // Suspense / Thriller / Horror
    if (lowerPath.includes('thriller') || lowerPath.includes('horror') || lowerPath.includes('bramayugam') || lowerPath.includes('drishyam') || lowerPath.includes('manjummel')) {
      return isBackdrop
        ? 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=1000'
        : 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=500';
    }

    // General Cinema fallbacks
    return isBackdrop
      ? 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000'
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500';
  }

  return `${IMAGE_BASE_URL}/${size}${path}`;
};
