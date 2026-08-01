-- =========================================================================
-- MASTER DATABASE TEARDOWN & RECREATION SCRIPT FOR STREAMIX PLATFORM
-- =========================================================================

-- 1. DROP ALL EXISTING TABLES & CONSTRAINTS (Teardown)
DROP TABLE IF EXISTS public.director_follows CASCADE;
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.films CASCADE;
DROP TABLE IF EXISTS public.heroes CASCADE;
DROP TABLE IF EXISTS public.directors CASCADE;
DROP TABLE IF EXISTS public.user_accounts CASCADE;

-- 2. CREATE TABLE: Custom User Credentials Table
CREATE TABLE public.user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL, -- Plain text password as requested by the user
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE TABLE: Directors Table
CREATE TABLE public.directors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  profile_pic_url TEXT DEFAULT '',
  follower_count INT DEFAULT 0,
  avg_rating NUMERIC(3, 2) DEFAULT 0.00,
  film_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE TABLE: Heroes Table
CREATE TABLE public.heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  profile_pic_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CREATE TABLE: Films Table (Includes YouTube and Drive Embed layout details)
CREATE TABLE public.films (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  director_id UUID REFERENCES public.directors(id) ON DELETE CASCADE,
  hero_ids UUID[] DEFAULT '{}',
  duration_sec INT NOT NULL DEFAULT 180,
  mood_tag TEXT NOT NULL CHECK (mood_tag IN ('uplifting', 'dark', 'romantic', 'thriller', 'comedy')),
  drive_file_id TEXT NOT NULL,
  drive_link TEXT NOT NULL,
  rating_avg NUMERIC(3, 2) DEFAULT 0.00,
  rating_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  thumbnail_url TEXT DEFAULT '',
  video_fallback_url TEXT DEFAULT '',
  video_source TEXT DEFAULT 'drive',
  youtube_url TEXT DEFAULT '',
  youtube_id TEXT DEFAULT ''
);

-- 6. CREATE TABLE: Comments Table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id UUID REFERENCES public.films(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_accounts(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CREATE TABLE: Ratings Table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id UUID REFERENCES public.films(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_accounts(id) ON DELETE CASCADE,
  stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_film_user_rating UNIQUE (film_id, user_id)
);

-- 8. CREATE TABLE: Director Follows Table
CREATE TABLE public.director_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_accounts(id) ON DELETE CASCADE,
  director_id UUID REFERENCES public.directors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_director_follow UNIQUE (user_id, director_id)
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES SETUP (Open access for web application)
-- =========================================================================

ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.films ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.director_follows ENABLE ROW LEVEL SECURITY;

-- User Accounts Policies
CREATE POLICY "user_accounts_all" ON public.user_accounts FOR ALL USING (true) WITH CHECK (true);

-- Directors Policies
CREATE POLICY "directors_all" ON public.directors FOR ALL USING (true) WITH CHECK (true);

-- Heroes Policies
CREATE POLICY "heroes_all" ON public.heroes FOR ALL USING (true) WITH CHECK (true);

-- Films Policies
CREATE POLICY "films_all" ON public.films FOR ALL USING (true) WITH CHECK (true);

-- Comments Policies
CREATE POLICY "comments_all" ON public.comments FOR ALL USING (true) WITH CHECK (true);

-- Ratings Policies
CREATE POLICY "ratings_all" ON public.ratings FOR ALL USING (true) WITH CHECK (true);

-- Follows Policies
CREATE POLICY "follows_all" ON public.director_follows FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- SEED INITIAL DATA (Admin Credentials, Test User Accounts)
-- =========================================================================

-- Seed accounts
INSERT INTO public.user_accounts (name, email, phone, password, role, avatar_url)
VALUES 
(
  'Streamix Admin',
  'admin@streamix.com',
  '1234567890',
  'admin123',
  'admin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav'
),
(
  'Cinephile User',
  'user@streamix.com',
  '9876543210',
  'user123',
  'user',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Tara'
);
