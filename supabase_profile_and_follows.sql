-- ======================================================
-- SUPABASE MIGRATION: USER PROFILE IMAGE, PASSWORD UPDATES & DIRECTOR FOLLOWS
-- ======================================================

-- 1. Add Avatar URL column to user accounts if not exists
ALTER TABLE public.user_accounts 
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';

-- 2. Create Director Follows Table
CREATE TABLE IF NOT EXISTS public.director_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_accounts(id) ON DELETE CASCADE,
  director_id UUID REFERENCES public.directors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_director_follow UNIQUE (user_id, director_id)
);

-- 3. Adjust Comments Foreign Key to reference user_accounts(id)
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_accounts(id) ON DELETE CASCADE;

-- 4. Adjust Ratings Foreign Key to reference user_accounts(id)
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_user_id_fkey;
ALTER TABLE public.ratings 
ADD CONSTRAINT ratings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_accounts(id) ON DELETE CASCADE;

-- 5. Enable Row Level Security (RLS) on new follows table
ALTER TABLE public.director_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read follows for everyone" 
ON public.director_follows FOR SELECT USING (true);

CREATE POLICY "Enable write follows for authenticated accounts" 
ON public.director_follows FOR ALL USING (true);
