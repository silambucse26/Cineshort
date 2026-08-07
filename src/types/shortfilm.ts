export type MoodTag = 'uplifting' | 'dark' | 'romantic' | 'thriller' | 'comedy';

export type DurationFilter = 'all' | 'under-1' | '1-3' | '3-5' | '5-plus';

export type SortOption = 'newest' | 'trending' | 'duration-asc' | 'duration-desc';

export type FilmStatus = 'pending' | 'approved' | 'rejected';

export interface Hero {
  id: string;
  name: string;
  bio: string;
  profile_pic_url: string;
  created_at?: string;
  film_count?: number;
}

export interface Director {
  id: string;
  name: string;
  bio: string;
  profile_pic_url: string;
  avg_rating: number;
  film_count: number;
  follower_count: number;
  created_at?: string;
  is_hero?: boolean;
}

export interface ShortFilm {
  id: string;
  title: string;
  director_id: string;
  director_name: string;
  director_pic?: string;
  hero_ids: string[];
  hero_names: string[];
  duration_sec: number; // in seconds
  mood_tag: MoodTag;
  drive_file_id: string;
  drive_link: string;
  youtube_url?: string;
  youtube_id?: string;
  video_source?: 'youtube' | 'drive' | 'direct';
  video_fallback_url?: string;
  thumbnail_url: string;
  hero_banner_url?: string;
  is_featured?: boolean;
  overview: string;
  rating_avg: number;
  rating_count: number;
  status: FilmStatus;
  upload_date: string;
  views_count: number;
  likes_count: number;
}

export interface Comment {
  id: string;
  film_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  user_role: 'director' | 'hero' | 'viewer' | 'admin';
  is_verified: boolean;
  text: string;
  timestamp: string;
  is_flagged?: boolean;
}

export interface Rating {
  id: string;
  film_id: string;
  user_id: string;
  stars: number;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

export interface UploadFormData {
  file: File | null;
  title: string;
  mood_tag: MoodTag;
  duration_sec: number;
  director_id: string;
  director_name: string;
  hero_names: string;
  overview: string;
}
