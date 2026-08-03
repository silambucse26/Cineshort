-- ==========================================================
-- STREAMIX DATABASE SCHEMA & QUERY REFERENCE
-- Wishlists, Watch Rooms, Live Chat, and User Interactions
-- ==========================================================

-- Wishlists Table
CREATE TABLE IF NOT EXISTS public.user_wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    film_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_film_wishlist UNIQUE (user_id, film_id)
);

-- Watch Rooms Table
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

-- Watch Room Live Chat Messages Table
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

-- Watch Room Participants Table
CREATE TABLE IF NOT EXISTS public.watch_room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(20) NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_room_participant UNIQUE (room_code, user_id)
);

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS idx_user_wishlists_user ON public.user_wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_rooms_code ON public.watch_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_watch_room_messages_code ON public.watch_room_messages(room_code);
CREATE INDEX IF NOT EXISTS idx_watch_room_participants_code ON public.watch_room_participants(room_code);

-- Sample Queries:
-- Get Wishlist items for a user
-- SELECT film_id FROM user_wishlists WHERE user_id = 'user-viewer';

-- Get active watch room by code
-- SELECT * FROM watch_rooms WHERE room_code = 'STREAM-9X2Y' AND is_active = true;

-- Get live chat messages for a room
-- SELECT * FROM watch_room_messages WHERE room_code = 'STREAM-9X2Y' ORDER BY created_at ASC;
