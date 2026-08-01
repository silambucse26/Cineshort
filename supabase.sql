-- ======================================================
-- SUPABASE DATABASE SCHEMA FOR SHORT-FILM DISCOVERY PLATFORM
-- ======================================================

-- 1. Directors Table
CREATE TABLE IF NOT EXISTS public.directors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  profile_pic_url TEXT DEFAULT '',
  follower_count INT DEFAULT 0,
  avg_rating NUMERIC(3, 2) DEFAULT 0.00,
  film_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Heroes Table
CREATE TABLE IF NOT EXISTS public.heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  profile_pic_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Films Table
CREATE TABLE IF NOT EXISTS public.films (
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
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id UUID REFERENCES public.films(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Ratings Table
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id UUID REFERENCES public.films(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_film_user_rating UNIQUE (film_id, user_id)
);

-- 6. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ======================================================

ALTER TABLE public.directors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.films ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Directors & Heroes: Public Read Access, Admin Write Access
CREATE POLICY "Public directors read access" ON public.directors FOR SELECT USING (true);
CREATE POLICY "Admin directors full access" ON public.directors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Public heroes read access" ON public.heroes FOR SELECT USING (true);
CREATE POLICY "Admin heroes full access" ON public.heroes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Films: Public Read Access for 'approved' status only, Admins view all statuses
CREATE POLICY "Public approved films read access" ON public.films FOR SELECT USING (
  status = 'approved' OR EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Authenticated users insert pending films" ON public.films FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

CREATE POLICY "Admins full film control" ON public.films FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Comments: Public Read, Auth Insert, Admin Delete
CREATE POLICY "Public comments read access" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Auth comments insert" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin comments delete" ON public.comments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Ratings: Public Read, Auth Insert/Update
CREATE POLICY "Public ratings read access" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Auth ratings insert" ON public.ratings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth ratings update" ON public.ratings FOR UPDATE USING (auth.uid() = user_id);

-- Admins Table Policy
CREATE POLICY "Admins read access" ON public.admins FOR SELECT USING (true);

-- ======================================================
-- SEED INITIAL MOCK DATA
-- ======================================================

INSERT INTO public.directors (id, name, bio, profile_pic_url, follower_count, avg_rating, film_count) VALUES
('d1111111-1111-1111-1111-111111111111', 'Aarav Sharma', 'Indie filmmaker specializing in psychological thrillers.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80', 14200, 4.90, 5),
('d2222222-2222-2222-2222-222222222222', 'Rohan Varma', 'Storyteller crafting romantic dramas.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80', 11800, 4.80, 4);

INSERT INTO public.heroes (id, name, bio, profile_pic_url) VALUES
('a1111111-1111-1111-1111-111111111111', 'Kabir Das', 'Method actor starring in thrillers.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80'),
('a2222222-2222-2222-2222-222222222222', 'Tara Malhotra', 'Theater performer and breakout short film actress.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80');

INSERT INTO public.films (id, title, director_id, hero_ids, duration_sec, mood_tag, drive_file_id, drive_link, rating_avg, rating_count, status) VALUES
('f1111111-1111-1111-1111-111111111111', 'The Silent Echo', 'd1111111-1111-1111-1111-111111111111', ARRAY['a1111111-1111-1111-1111-111111111111'::uuid], 165, 'thriller', '1Bzi-KXJ_05sX1J5T_SampleDriveId1', 'https://drive.google.com/file/d/1Bzi-KXJ_05sX1J5T_SampleDriveId1/preview', 4.90, 128, 'approved'),
('f2222222-2222-2222-2222-222222222222', 'Sunrise at 4 AM', 'd2222222-2222-2222-2222-222222222222', ARRAY['a2222222-2222-2222-2222-222222222222'::uuid], 110, 'uplifting', '1Azi-KXJ_05sX2J5T_SampleDriveId2', 'https://drive.google.com/file/d/1Azi-KXJ_05sX2J5T_SampleDriveId2/preview', 4.80, 94, 'approved'),
('f3333333-3333-3333-3333-333333333333', 'Neo-Subway Crypt', 'd1111111-1111-1111-1111-111111111111', ARRAY['a1111111-1111-1111-1111-111111111111'::uuid], 210, 'dark', '1Dzi-KXJ_05sX4J5T_SampleDriveId4', 'https://drive.google.com/file/d/1Dzi-KXJ_05sX4J5T_SampleDriveId4/preview', 0.00, 0, 'pending');
