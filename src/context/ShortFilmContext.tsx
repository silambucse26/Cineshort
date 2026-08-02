'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShortFilm, Director, Hero, Comment, Rating, FilmStatus } from '../types/shortfilm';
import { INITIAL_FILMS, INITIAL_DIRECTORS, INITIAL_HEROES, INITIAL_COMMENTS } from '../mockData/shortFilmsData';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export interface UserPersona {
  id: string;
  name: string;
  avatar: string;
  role: 'director' | 'hero' | 'viewer' | 'admin';
  is_verified: boolean;
  email?: string;
  phone?: string;
}

const DEFAULT_PERSONAS: UserPersona[] = [
  {
    id: 'user-viewer',
    name: 'Cinephile Viewer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    role: 'viewer',
    is_verified: false,
  },
  {
    id: 'dir-1',
    name: 'Aarav Sharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    role: 'director',
    is_verified: true,
  },
  {
    id: 'hero-1',
    name: 'Kabir Das',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80',
    role: 'hero',
    is_verified: true,
  },
  {
    id: 'admin-1',
    name: 'Head Administrator',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=500&q=80',
    role: 'admin',
    is_verified: true,
  },
];

interface ShortFilmContextType {
  films: ShortFilm[];
  approvedFilms: ShortFilm[];
  pendingFilms: ShortFilm[];
  directors: Director[];
  heroes: Hero[];
  comments: Comment[];
  userRatings: Record<string, number>;
  followedDirectorIds: string[];
  activePersona: UserPersona;
  setActivePersona: (persona: UserPersona) => void;
  personas: UserPersona[];
  isAdminAuthenticated: boolean;
  isLoaded: boolean;
  
  // Public Actions
  incrementViews: (filmId: string) => void;
  rateFilm: (filmId: string, stars: number) => void;
  addComment: (filmId: string, text: string) => void;
  addFilm: (newFilm: Omit<ShortFilm, 'id' | 'rating_avg' | 'rating_count' | 'upload_date' | 'views_count' | 'likes_count'>) => ShortFilm;
  toggleFollowDirector: (directorId: string) => void;
  
  // Custom Auth Actions
  loginWithCredentials: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithCredentials: (name: string, email: string, phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
  updateUserProfile: (name: string, phone: string, avatarUrl: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  
  // Admin Actions
  approveFilm: (filmId: string) => void;
  rejectFilm: (filmId: string) => void;
  updateFilm: (filmId: string, updatedData: Partial<ShortFilm>) => void;
  deleteFilm: (filmId: string) => void;
  updateDirector: (directorId: string, data: Partial<Director>) => void;
  updateHero: (heroId: string, data: Partial<Hero>) => void;
  deleteDirector: (directorId: string) => void;
  deleteHero: (heroId: string) => void;
  addDirector: (director: Omit<Director, 'id' | 'avg_rating' | 'film_count' | 'follower_count'>) => Director;
  addHero: (hero: Omit<Hero, 'id'>) => Hero;
  deleteComment: (commentId: string) => void;
  toggleFlagComment: (commentId: string) => void;
  loginAdmin: (email: string, pass: string) => boolean;
  logoutAdmin: () => void;

  // Getters
  getFilmById: (filmId: string) => ShortFilm | undefined;
  getDirectorById: (directorId: string) => Director | undefined;
  getCommentsForFilm: (filmId: string) => Comment[];
  getFilmsByDirector: (directorId: string) => ShortFilm[];
  getFilmsByHero: (heroName: string) => ShortFilm[];
}

const ShortFilmContext = createContext<ShortFilmContextType | undefined>(undefined);

export const ShortFilmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [films, setFilms] = useState<ShortFilm[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [followedDirectorIds, setFollowedDirectorIds] = useState<string[]>([]);
  const [activePersona, setActivePersona] = useState<UserPersona>(DEFAULT_PERSONAS[0]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load saved state from localStorage after initial hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFilms = localStorage.getItem('streamix_short_films_v2');
      if (savedFilms) {
        try {
          const parsed = JSON.parse(savedFilms);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.map((f: ShortFilm) => ({
              ...f,
              video_fallback_url: (f.video_fallback_url && (f.video_fallback_url.startsWith('blob:') || f.video_fallback_url.includes('drive.google.com')))
                ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
                : f.video_fallback_url
            }));
            setFilms(sanitized);
          }
        } catch {}
      }
      const savedDirs = localStorage.getItem('streamix_directors_v2');
      if (savedDirs) {
        try { setDirectors(JSON.parse(savedDirs)); } catch {}
      }
      const savedHeroes = localStorage.getItem('streamix_heroes_v2');
      if (savedHeroes) {
        try { setHeroes(JSON.parse(savedHeroes)); } catch {}
      }
      const savedComments = localStorage.getItem('streamix_comments_v2');
      if (savedComments) {
        try { setComments(JSON.parse(savedComments)); } catch {}
      }

      // Load user session
      const savedSession = localStorage.getItem('streamix_user_session');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          if (session && session.persona) {
            setActivePersona(session.persona);
            setIsAdminAuthenticated(session.role === 'admin');
          }
        } catch {}
      }
      
      setIsLoaded(true);
    }
  }, []);

  // Hydrate states from Supabase if configured
  useEffect(() => {
    const loadDataFromSupabase = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        // Load follows list to compute real counts
        const { data: allFollows } = await supabase
          .from('director_follows')
          .select('director_id');

        // Load Directors
        const { data: dbDirs, error: dirsErr } = await supabase
          .from('directors')
          .select('*');
        if (!dirsErr && dbDirs) {
          const processedDirs = dbDirs.map((dir: any) => {
            const count = allFollows?.filter((f: any) => f.director_id === dir.id).length || 0;
            return {
              ...dir,
              follower_count: count
            };
          });
          setDirectors(processedDirs);
        }

        // Load Heroes
        const { data: dbHeroes } = await supabase
          .from('heroes')
          .select('*');
        if (dbHeroes) {
          setHeroes(dbHeroes);
        }

        // Load Films
        const { data: dbFilms, error: filmsErr } = await supabase
          .from('films')
          .select('*');
        if (!filmsErr && dbFilms) {
          const mapped = dbFilms.map((f: any) => {
            const dir = dbDirs?.find((d: any) => d.id === f.director_id);
            const filmHeroes = f.hero_ids && Array.isArray(f.hero_ids)
              ? f.hero_ids.map((hId: string) => dbHeroes?.find((h: any) => h.id === hId)?.name).filter(Boolean)
              : [];
            return {
              ...f,
              director_name: dir?.name || 'Independent Director',
              director_pic: dir?.profile_pic_url || '',
              hero_names: filmHeroes.length > 0 ? filmHeroes : ['Independent Cast'],
              video_fallback_url: f.video_fallback_url || f.drive_link,
              thumbnail_url: f.thumbnail_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
              status: f.status || 'approved',
            };
          });
          setFilms(mapped);
        }

        // Load Comments
        const { data: dbComments, error: commsErr } = await supabase
          .from('comments')
          .select('*');
        if (!commsErr && dbComments) {
          const { data: users } = await supabase.from('user_accounts').select('id, name, role');
          const mappedComments = dbComments.map((c: any) => {
            const user = users?.find((u: any) => u.id === c.user_id);
            return {
              id: c.id,
              film_id: c.film_id,
              user_id: c.user_id,
              user_name: user?.name || 'Anonymous User',
              user_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`,
              user_role: user?.role || 'viewer',
              is_verified: user?.role === 'admin',
              text: c.text,
              timestamp: new Date(c.created_at).toLocaleDateString(),
              is_flagged: false
            };
          });
          setComments(mappedComments);
        }

        // Load follows
        if (activePersona && activePersona.email) {
          const { data: follows } = await supabase
            .from('director_follows')
            .select('director_id')
            .eq('user_id', activePersona.id);
          if (follows) {
            setFollowedDirectorIds(follows.map((f: any) => f.director_id));
          }
        }
      } catch (e) {
        console.error('Error loading data from Supabase:', e);
      }
    };

    if (isLoaded) {
      loadDataFromSupabase();
    }
  }, [isLoaded, activePersona?.id]);

  // Sync state updates to localStorage only after initial client load
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('streamix_short_films_v2', JSON.stringify(films));
    }
  }, [films, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('streamix_directors_v2', JSON.stringify(directors));
    }
  }, [directors, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('streamix_heroes_v2', JSON.stringify(heroes));
    }
  }, [heroes, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('streamix_comments_v2', JSON.stringify(comments));
    }
  }, [comments, isLoaded]);

  // Derived film lists
  const approvedFilms = films.filter((f) => f.status === 'approved');
  const pendingFilms = films.filter((f) => f.status === 'pending');

  // Rate film
  const rateFilm = (filmId: string, stars: number) => {
    setUserRatings((prev) => ({ ...prev, [filmId]: stars }));

    if (isSupabaseConfigured && supabase && activePersona.email) {
      (async () => {
        try {
          await supabase
            .from('ratings')
            .upsert({
              film_id: filmId,
              user_id: activePersona.id,
              stars: stars
            }, { onConflict: 'film_id,user_id' });

          const { data: allRatings } = await supabase
            .from('ratings')
            .select('stars')
            .eq('film_id', filmId);

          if (allRatings && allRatings.length > 0) {
            const avg = Number((allRatings.reduce((acc, r) => acc + r.stars, 0) / allRatings.length).toFixed(2));
            const count = allRatings.length;
            await supabase
              .from('films')
              .update({ rating_avg: avg, rating_count: count })
              .eq('id', filmId);

            setFilms((prev) => prev.map((f) => f.id === filmId ? { ...f, rating_avg: avg, rating_count: count } : f));
          }
        } catch (e) {
          console.error('Error saving rating to Supabase:', e);
        }
      })();
    }

    let targetDirectorId = '';
    setFilms((prevFilms) =>
      prevFilms.map((film) => {
        if (film.id === filmId) {
          targetDirectorId = film.director_id;
          const oldTotal = film.rating_avg * film.rating_count;
          const prevUserRating = userRatings[film.id];
          let newCount = film.rating_count;
          let newSum = oldTotal;

          if (prevUserRating) {
            newSum = oldTotal - prevUserRating + stars;
          } else {
            newCount += 1;
            newSum = oldTotal + stars;
          }

          const newAvg = Number((newSum / newCount).toFixed(2));
          return {
            ...film,
            rating_avg: newAvg,
            rating_count: newCount,
          };
        }
        return film;
      })
    );

    if (targetDirectorId) {
      setTimeout(() => {
        setDirectors((prevDirs) =>
          prevDirs.map((dir) => {
            if (dir.id === targetDirectorId) {
              const directorFilms = films.filter((f) => f.director_id === dir.id);
              if (directorFilms.length === 0) return dir;
              const totalRating = directorFilms.reduce((acc, f) => acc + (f.id === filmId ? stars : f.rating_avg), 0);
              const newDirectorAvg = Number((totalRating / directorFilms.length).toFixed(2));
              return { ...dir, avg_rating: newDirectorAvg };
            }
            return dir;
          })
        );
      }, 50);
    }
  };

  const addComment = (filmId: string, text: string) => {
    if (!text.trim()) return;
    const commId = isSupabaseConfigured ? crypto.randomUUID() : `comm-${Date.now()}`;
    const newComment: Comment = {
      id: commId,
      film_id: filmId,
      user_id: activePersona.id,
      user_name: activePersona.name,
      user_avatar: activePersona.avatar,
      user_role: activePersona.role,
      is_verified: activePersona.is_verified,
      text: text.trim(),
      timestamp: 'Just now',
      is_flagged: false,
    };
    setComments((prev) => [newComment, ...prev]);

    if (isSupabaseConfigured && supabase && activePersona.email) {
      (async () => {
        try {
          await supabase
            .from('comments')
            .insert([{
              id: commId,
              film_id: filmId,
              user_id: activePersona.id,
              text: text.trim(),
              is_verified: activePersona.role === 'admin'
            }]);
        } catch (e) {
          console.error('Error saving comment to Supabase:', e);
        }
      })();
    }
  };

  const addFilm = (
    filmData: Omit<ShortFilm, 'id' | 'rating_avg' | 'rating_count' | 'upload_date' | 'views_count' | 'likes_count'>
  ): ShortFilm => {
    const isUuid = (val: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
    const newId = isSupabaseConfigured ? crypto.randomUUID() : `film-${Date.now()}`;
    const rawFallback = filmData.video_fallback_url;
    const isInvalidFallback = !rawFallback || rawFallback.includes('drive.google.com');
    const safeFallback = isInvalidFallback 
      ? (filmData.drive_link && filmData.drive_link.includes('drive.google.com') ? filmData.drive_link : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4')
      : rawFallback;

    const publishedFilm: ShortFilm = {
      ...filmData,
      id: newId,
      video_fallback_url: safeFallback,
      rating_avg: 5.0,
      rating_count: 1,
      status: filmData.status || 'approved',
      upload_date: new Date().toISOString().split('T')[0],
      views_count: 1,
      likes_count: 1,
    };

    setFilms((prev) => [publishedFilm, ...prev]);

    const safeDirectorId = isUuid(filmData.director_id) ? filmData.director_id : crypto.randomUUID();

    setDirectors((prev) => {
      const existing = prev.find((d) => d.id === filmData.director_id || d.name === filmData.director_name);
      if (existing) {
        return prev.map((d) => (d.id === existing.id ? { ...d, film_count: d.film_count + 1 } : d));
      } else {
        const newDir: Director = {
          id: safeDirectorId,
          name: filmData.director_name,
          bio: 'Emerging short filmmaker.',
          profile_pic_url: activePersona.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
          avg_rating: 5.0,
          film_count: 1,
          follower_count: 0,
        };
        return [newDir, ...prev];
      }
    });

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const { data: existingDir } = await supabase
            .from('directors')
            .select('id')
            .eq('id', safeDirectorId)
            .maybeSingle();

          if (!existingDir) {
            await supabase
              .from('directors')
              .insert([{
                id: safeDirectorId,
                name: filmData.director_name,
                bio: 'Emerging short filmmaker.',
                profile_pic_url: activePersona.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
                follower_count: 0,
                avg_rating: 5.0,
                film_count: 1
              }]);
          } else {
            const { data: dirInfo } = await supabase
              .from('directors')
              .select('film_count')
              .eq('id', safeDirectorId)
              .single();
            await supabase
              .from('directors')
              .update({ film_count: (dirInfo?.film_count || 0) + 1 })
              .eq('id', safeDirectorId);
          }

          await supabase
            .from('films')
            .insert([{
              id: newId,
              title: filmData.title,
              director_id: safeDirectorId,
              hero_ids: filmData.hero_ids || [],
              duration_sec: filmData.duration_sec,
              mood_tag: filmData.mood_tag,
              drive_file_id: filmData.drive_file_id,
              drive_link: filmData.drive_link,
              rating_avg: 5.0,
              rating_count: 1,
              status: filmData.status || 'approved',
              thumbnail_url: filmData.thumbnail_url || '',
              video_fallback_url: safeFallback,
              video_source: filmData.video_source || 'drive',
              youtube_url: filmData.youtube_url || '',
              youtube_id: filmData.youtube_id || ''
            }]);
        } catch (e) {
          console.error('Error saving film/director to Supabase:', e);
        }
      })();
    }

    return publishedFilm;
  };

  // ADMIN ACTIONS
  const approveFilm = (filmId: string) => {
    setFilms((prev) => prev.map((f) => (f.id === filmId ? { ...f, status: 'approved' } : f)));
  };

  const rejectFilm = (filmId: string) => {
    setFilms((prev) => prev.map((f) => (f.id === filmId ? { ...f, status: 'rejected' } : f)));
  };

  const updateFilm = (filmId: string, updatedData: Partial<ShortFilm>) => {
    setFilms((prev) => prev.map((f) => (f.id === filmId ? { ...f, ...updatedData } : f)));
  };

  const deleteFilm = (filmId: string) => {
    setFilms((prev) => prev.filter((f) => f.id !== filmId));
  };

  const updateDirector = (directorId: string, data: Partial<Director>) => {
    setDirectors((prev) => prev.map((d) => (d.id === directorId ? { ...d, ...data } : d)));
    
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from('directors')
            .update(data)
            .eq('id', directorId);
        } catch (e) {
          console.error('Error updating director in Supabase:', e);
        }
      })();
    }
  };

  const updateHero = (heroId: string, data: Partial<Hero>) => {
    setHeroes((prev) => prev.map((h) => (h.id === heroId ? { ...h, ...data } : h)));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from('heroes')
            .update(data)
            .eq('id', heroId);
        } catch (e) {
          console.error('Error updating hero in Supabase:', e);
        }
      })();
    }
  };

  const deleteDirector = (directorId: string) => {
    setDirectors((prev) => prev.filter((d) => d.id !== directorId));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from('directors')
            .delete()
            .eq('id', directorId);
        } catch (e) {
          console.error('Error deleting director in Supabase:', e);
        }
      })();
    }
  };

  const deleteHero = (heroId: string) => {
    setHeroes((prev) => prev.filter((h) => h.id !== heroId));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from('heroes')
            .delete()
            .eq('id', heroId);
        } catch (e) {
          console.error('Error deleting hero in Supabase:', e);
        }
      })();
    }
  };

  const addDirector = (directorData: Omit<Director, 'id' | 'avg_rating' | 'film_count' | 'follower_count'>): Director => {
    const newId = isSupabaseConfigured ? crypto.randomUUID() : `dir-${Date.now()}`;
    const newDir: Director = {
      ...directorData,
      id: newId,
      avg_rating: 5.0,
      film_count: 0,
      follower_count: 0,
    };
    setDirectors((prev) => [newDir, ...prev]);

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from('directors')
            .insert([{
              id: newId,
              name: directorData.name,
              bio: directorData.bio,
              profile_pic_url: directorData.profile_pic_url,
              avg_rating: 5.0,
              film_count: 0,
              follower_count: 0
            }]);
        } catch (e) {
          console.error('Error creating director in Supabase:', e);
        }
      })();
    }

    return newDir;
  };

  const addHero = (heroData: Omit<Hero, 'id'>): Hero => {
    const newId = isSupabaseConfigured ? crypto.randomUUID() : `hero-${Date.now()}`;
    const newHero: Hero = {
      ...heroData,
      id: newId,
      film_count: 0,
    };
    setHeroes((prev) => [newHero, ...prev]);

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from('heroes')
            .insert([{
              id: newId,
              name: heroData.name,
              bio: heroData.bio,
              profile_pic_url: heroData.profile_pic_url,
              film_count: 0
            }]);
        } catch (e) {
          console.error('Error creating hero in Supabase:', e);
        }
      })();
    }

    return newHero;
  };

  const deleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const toggleFlagComment = (commentId: string) => {
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, is_flagged: !c.is_flagged } : c)));
  };

  const loginUser = (persona: UserPersona, role: 'admin' | 'user') => {
    setActivePersona(persona);
    setIsAdminAuthenticated(role === 'admin');
    localStorage.setItem('streamix_user_session', JSON.stringify({ persona, role }));
  };

  const logoutUser = () => {
    setActivePersona(DEFAULT_PERSONAS[0]);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('streamix_user_session');
  };

  const loginWithCredentials = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      if (email === 'admin@streamix.com' && pass === 'admin123') {
        const persona: UserPersona = {
          id: 'admin-1',
          name: 'Streamix Admin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
          role: 'admin',
          is_verified: true,
          email: 'admin@streamix.com',
          phone: '1234567890'
        };
        loginUser(persona, 'admin');
        return { success: true };
      } else if (email === 'user@streamix.com' && pass === 'user123') {
        const persona: UserPersona = {
          id: 'user-viewer',
          name: 'Cinephile User',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
          role: 'viewer',
          is_verified: false,
          email: 'user@streamix.com',
          phone: '9876543210'
        };
        loginUser(persona, 'user');
        return { success: true };
      }
      return { success: false, error: 'Invalid mock credentials. Try admin@streamix.com / admin123' };
    }

    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return { success: false, error: 'No user account found with this email.' };
      }

      if (data.password !== pass) {
        return { success: false, error: 'Incorrect password.' };
      }

      const persona: UserPersona = {
        id: data.id,
        name: data.name,
        avatar: data.avatar_url || (data.role === 'admin'
          ? `https://api.dicebear.com/7.x/bottts/svg?seed=${data.name}`
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`),
        role: data.role === 'admin' ? 'admin' : 'viewer',
        is_verified: data.role === 'admin',
        email: data.email,
        phone: data.phone
      };

      loginUser(persona, data.role);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Database connection error.' };
    }
  };

  const signUpWithCredentials = async (name: string, email: string, phone: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      const persona: UserPersona = {
        id: `user-${Date.now()}`,
        name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        role: 'viewer',
        is_verified: false,
        email,
        phone
      };
      loginUser(persona, 'user');
      return { success: true };
    }

    try {
      const { data: existing } = await supabase
        .from('user_accounts')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const { data, error } = await supabase
        .from('user_accounts')
        .insert([
          {
            name,
            email,
            phone,
            password: pass,
            role: 'user'
          }
        ])
        .select()
        .single();

      if (error || !data) {
        return { success: false, error: error?.message || 'Failed to create user account.' };
      }

      const persona: UserPersona = {
        id: data.id,
        name: data.name,
        avatar: data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
        role: 'viewer',
        is_verified: false,
        email: data.email,
        phone: data.phone
      };

      loginUser(persona, 'user');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Database connection error.' };
    }
  };

  const loginAdmin = (email: string, pass: string) => {
    if (email.includes('admin') || pass === 'admin123' || pass === 'password') {
      setIsAdminAuthenticated(true);
      setActivePersona(DEFAULT_PERSONAS[3]);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    logoutUser();
  };

  const updateUserProfile = async (
    name: string,
    phone: string,
    avatarUrl: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const updatedPersona: UserPersona = {
      ...activePersona,
      name: name.trim(),
      phone: phone.trim(),
      avatar: avatarUrl.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    };

    if (!isSupabaseConfigured || !supabase) {
      setActivePersona(updatedPersona);
      localStorage.setItem('streamix_user_session', JSON.stringify({ persona: updatedPersona, role: updatedPersona.role }));
      return { success: true };
    }

    try {
      const updateData: any = {
        name: name.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl.trim(),
      };
      if (password && password.trim()) {
        updateData.password = password.trim();
      }

      const { error } = await supabase
        .from('user_accounts')
        .update(updateData)
        .eq('id', activePersona.id);

      if (error) {
        return { success: false, error: error.message };
      }

      setActivePersona(updatedPersona);
      localStorage.setItem('streamix_user_session', JSON.stringify({ persona: updatedPersona, role: updatedPersona.role }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Database update error.' };
    }
  };

  const toggleFollowDirector = (directorId: string) => {
    const isFollowing = followedDirectorIds.includes(directorId);
    
    // 1. Update followed director IDs
    setFollowedDirectorIds((prev) =>
      isFollowing ? prev.filter((id) => id !== directorId) : [...prev, directorId]
    );

    // 2. Update local directors state count
    setDirectors((prevDirs) =>
      prevDirs.map((d) =>
        d.id === directorId
          ? { ...d, follower_count: Math.max(0, d.follower_count + (isFollowing ? -1 : 1)) }
          : d
      )
    );

    // 3. Sync to Supabase in background
    if (isSupabaseConfigured && supabase && activePersona.email) {
      (async () => {
        try {
          if (isFollowing) {
            await supabase
              .from('director_follows')
              .delete()
              .eq('user_id', activePersona.id)
              .eq('director_id', directorId);
          } else {
            await supabase
              .from('director_follows')
              .insert([{ user_id: activePersona.id, director_id: directorId }]);
          }

          const { data: dirData } = await supabase
            .from('directors')
            .select('follower_count')
            .eq('id', directorId)
            .single();
          if (dirData) {
            const currentFollowers = dirData.follower_count || 0;
            await supabase
              .from('directors')
              .update({ follower_count: Math.max(0, currentFollowers + (isFollowing ? -1 : 1)) })
              .eq('id', directorId);
          }
        } catch (e) {
          console.error('Error toggling follow in Supabase:', e);
        }
      })();
    }
  };

  const getFilmById = (filmId: string) => films.find((f) => f.id === filmId);
  const getDirectorById = (directorId: string) => directors.find((d) => d.id === directorId);
  const getCommentsForFilm = (filmId: string) => comments.filter((c) => c.film_id === filmId);
  const getFilmsByDirector = (directorId: string) => films.filter((f) => f.director_id === directorId);
  const getFilmsByHero = (heroName: string) =>
    films.filter((f) => f.hero_names.some((name) => name.toLowerCase().includes(heroName.toLowerCase())));

  const incrementViews = (filmId: string) => {
    setFilms((prev) =>
      prev.map((f) => (f.id === filmId ? { ...f, views_count: (f.views_count || 0) + 1 } : f))
    );
  };

  return (
    <ShortFilmContext.Provider
      value={{
        films,
        approvedFilms,
        pendingFilms,
        directors,
        heroes,
        comments,
        userRatings,
        followedDirectorIds,
        activePersona,
        setActivePersona,
        personas: DEFAULT_PERSONAS,
        isAdminAuthenticated,
        isLoaded,
        loginWithCredentials,
        signUpWithCredentials,
        logoutUser,
        updateUserProfile,
        incrementViews,
        rateFilm,
        addComment,
        addFilm,
        toggleFollowDirector,
        approveFilm,
        rejectFilm,
        updateFilm,
        deleteFilm,
        updateDirector,
        updateHero,
        deleteDirector,
        deleteHero,
        addDirector,
        addHero,
        deleteComment,
        toggleFlagComment,
        loginAdmin,
        logoutAdmin,
        getFilmById,
        getDirectorById,
        getCommentsForFilm,
        getFilmsByDirector,
        getFilmsByHero,
      }}
    >
      {children}
    </ShortFilmContext.Provider>
  );
};

export const useShortFilm = () => {
  const context = useContext(ShortFilmContext);
  if (!context) {
    throw new Error('useShortFilm must be used within a ShortFilmProvider');
  }
  return context;
};
