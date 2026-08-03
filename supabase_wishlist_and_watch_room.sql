-- ==========================================================
-- STREAMIX / CINESHORT: SUPABASE DATABASE SCHEMA
-- Features: User Wishlists, Collaborative Watch Rooms & Live Chat
-- ==========================================================

-- 1. USER WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS public.user_wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    film_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_film_wishlist UNIQUE (user_id, film_id)
);

CREATE INDEX IF NOT EXISTS idx_user_wishlists_user_id ON public.user_wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wishlists_film_id ON public.user_wishlists(film_id);

-- Enable RLS for user_wishlists
ALTER TABLE public.user_wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on user_wishlists" 
    ON public.user_wishlists FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert on user_wishlists" 
    ON public.user_wishlists FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on user_wishlists" 
    ON public.user_wishlists FOR DELETE USING (true);


-- 2. COLLABORATIVE WATCH ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.watch_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(20) UNIQUE NOT NULL,
    room_title TEXT DEFAULT 'Movie Watch Party',
    host_user_id TEXT NOT NULL,
    host_user_name TEXT DEFAULT 'Host',
    film_id TEXT NOT NULL,
    is_playing BOOLEAN DEFAULT false,
    current_time_sec NUMERIC(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watch_rooms_code ON public.watch_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_watch_rooms_host ON public.watch_rooms(host_user_id);

-- Enable RLS for watch_rooms
ALTER TABLE public.watch_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on watch_rooms" 
    ON public.watch_rooms FOR SELECT USING (true);

CREATE POLICY "Allow public insert on watch_rooms" 
    ON public.watch_rooms FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on watch_rooms" 
    ON public.watch_rooms FOR UPDATE USING (true);


-- 3. WATCH ROOM LIVE CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.watch_room_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(20) NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    message TEXT NOT NULL,
    is_system_msg BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_messages_code ON public.watch_room_messages(room_code);
CREATE INDEX IF NOT EXISTS idx_room_messages_created ON public.watch_room_messages(created_at);

-- Enable RLS for watch_room_messages
ALTER TABLE public.watch_room_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on watch_room_messages" 
    ON public.watch_room_messages FOR SELECT USING (true);

CREATE POLICY "Allow public insert on watch_room_messages" 
    ON public.watch_room_messages FOR INSERT WITH CHECK (true);


-- 4. WATCH ROOM ACTIVE PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.watch_room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(20) NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_room_participant UNIQUE (room_code, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_participants_code ON public.watch_room_participants(room_code);

-- Enable RLS for watch_room_participants
ALTER TABLE public.watch_room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on watch_room_participants" 
    ON public.watch_room_participants FOR SELECT USING (true);

CREATE POLICY "Allow public insert on watch_room_participants" 
    ON public.watch_room_participants FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete on watch_room_participants" 
    ON public.watch_room_participants FOR DELETE USING (true);

-- Enable Realtime for Watch Rooms and Messages
ALTER PUBLICATION supabase_realtime ADD TABLE watch_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE watch_room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE watch_room_participants;
