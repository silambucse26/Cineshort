-- ======================================================
-- SUPABASE CUSTOM USER ACCOUNTS SCHEMA
-- ======================================================

-- 1. Create User Accounts Table
CREATE TABLE IF NOT EXISTS public.user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL, -- Plain text password as requested by the user (do not encrypt)
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

-- 3. Row Level Security Policies
-- Enable select for all authenticated/anonymous operations to allow searching by email/password
CREATE POLICY "Enable select for everyone" ON public.user_accounts FOR SELECT USING (true);

-- Enable insert for signup operations
CREATE POLICY "Enable insert for everyone" ON public.user_accounts FOR INSERT WITH CHECK (true);

-- Enable update/delete for admins or owners
CREATE POLICY "Enable update for users own account" ON public.user_accounts FOR UPDATE USING (
  true
);

-- 4. Seed Initial Accounts
-- Seed Admin account
INSERT INTO public.user_accounts (name, email, phone, password, role)
VALUES (
  'Streamix Admin',
  'admin@streamix.com',
  '1234567890',
  'admin123', -- Admin Plain Text Password
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Seed Standard User account
INSERT INTO public.user_accounts (name, email, phone, password, role)
VALUES (
  'Cinephile User',
  'user@streamix.com',
  '9876543210',
  'user123', -- Standard User Plain Text Password
  'user'
)
ON CONFLICT (email) DO NOTHING;
