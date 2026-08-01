export interface CastMember {
  name: string;
  character: string;
  profilePath?: string;
}

export interface CrewMember {
  name: string;
  job: string;
  profilePath?: string;
}

export interface Review {
  id: string;
  author: string;
  content: string;
  rating: number; // 1-10
  date: string;
}

export interface Movie {
  id: string;
  title: string;
  backdropPath: string;
  posterPath: string;
  overview: string;
  releaseYear: string;
  releaseDate?: string;
  runtime: string; // e.g. "2h 22m" or "142 min"
  rating: number; // 0-10 or 0-5
  popularity: number;
  genres: string[];
  languages: string[];
  cast: CastMember[];
  crew: CrewMember[];
  budget?: string;
  revenue?: string;
  officialWebsite?: string;
  youtubeKey: string; // Official trailer video key
  videoUrl?: string; // Direct video URL or Google Drive preview link
  screenshots?: string[];
  productionCompanies?: string[];
  similarIds?: string[];
  status?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface WatchItem {
  id: string;
  movieId: string;
  addedAt: string;
}

export interface FavoriteItem {
  id: string;
  movieId: string;
  addedAt: string;
}

export interface ContinueWatchItem {
  id: string;
  movieId: string;
  progress: number; // percentage 0-100
  updatedAt: string;
}
