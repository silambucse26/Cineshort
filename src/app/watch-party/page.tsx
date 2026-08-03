'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Users, 
  Tv, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  Film, 
  Play, 
  Clock, 
  User, 
  CheckCircle2, 
  Share2, 
  Lock,
  Compass
} from 'lucide-react';
import { useShortFilm } from '../../context/ShortFilmContext';
import { ShortFilm } from '../../types/shortfilm';
import { formatDuration } from '../../services/driveService';

import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

function WatchPartyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFilmId = searchParams.get('filmId');

  const { films, approvedFilms, activePersona } = useShortFilm();

  const [selectedFilmId, setSelectedFilmId] = useState<string>(preselectedFilmId || (approvedFilms[0]?.id || ''));
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [roomTitle, setRoomTitle] = useState<string>('Movie Watch Party');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedFilmId) {
      setSelectedFilmId(preselectedFilmId);
    } else if (approvedFilms.length > 0 && !selectedFilmId) {
      setSelectedFilmId(approvedFilms[0].id);
    }
  }, [preselectedFilmId, approvedFilms, selectedFilmId]);

  const selectedFilm = films.find((f) => f.id === selectedFilmId) || approvedFilms[0];

  // Helper to generate unique room code (e.g. ROOM-7X9P)
  const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ROOM-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFilmId) {
      setErrorMsg('Please select a short film for your watch room.');
      return;
    }

    const code = generateRoomCode();
    const roomTitleFinal = roomTitle.trim() || `${selectedFilm?.title || 'Film'} Watch Room`;
    const hostId = activePersona?.id || 'user-viewer';
    const hostName = activePersona?.name || 'Watch Party Host';

    // Save room data into localStorage for instant local tab synchronization
    const initialRoomData = {
      code,
      title: roomTitleFinal,
      filmId: selectedFilmId,
      hostId,
      hostName,
      isPlaying: false,
      currentTime: 0,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(`streamix_room_${code}`, JSON.stringify(initialRoomData));

    // Save room to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('watch_rooms').upsert([
          {
            room_code: code,
            room_title: roomTitleFinal,
            host_user_id: hostId,
            host_user_name: hostName,
            film_id: selectedFilmId,
            is_playing: false,
            current_time_sec: 0,
            is_active: true,
          }
        ], { onConflict: 'room_code' });
      } catch (err) {
        console.warn('Could not insert room into Supabase:', err);
      }
    }

    router.push(`/watch-party/${code}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Please enter a valid Room Code (e.g. ROOM-7X9P)');
      return;
    }

    router.push(`/watch-party/${cleanCode}`);
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Hero Banner */}
        <div className="card-flat p-6 sm:p-10 border-2 border-[#FFD60A]/30 relative overflow-hidden bg-gradient-to-br from-[#1F2833] via-[#0B0C10] to-[#0B0C10] rounded-3xl shadow-2xl">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#FFD60A]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#FFD60A]/20 border border-[#FFD60A]/50 text-[#FFD60A] px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-md">
              <Users className="w-4 h-4" />
              <span>Collaborative Watch Party</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#F5F5F5] tracking-tight leading-tight">
              Watch Movies Together in <span className="text-[#FFD60A]">Real-Time Sync</span>
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Connect with friends, share room codes, watch synchronized short films, and chat live with an embedded interactive Chat Box.
            </p>
          </div>
        </div>

        {/* Action Grid: Create Room OR Join via Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* CREATE WATCH ROOM CARD */}
          <div className="card-flat p-6 sm:p-8 space-y-6 flex flex-col justify-between border-t-4 border-t-[#FFD60A]">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#FFD60A]/20 text-[#FFD60A] rounded-xl border border-[#FFD60A]/40">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#F5F5F5] uppercase tracking-wider">Host a Watch Room</h2>
                  <p className="text-[11px] text-gray-400">Select a film and share your unique room code with friends.</p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/60 border border-red-500/50 text-red-400 text-xs rounded-xl font-bold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
                {/* Room Title */}
                <div>
                  <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={roomTitle}
                    onChange={(e) => setRoomTitle(e.target.value)}
                    placeholder="e.g. Friday Night Movie Session"
                    className="w-full bg-[#0B0C10] border border-gray-700 focus:border-[#FFD60A] rounded-xl p-3 text-[#F5F5F5] outline-none font-semibold"
                  />
                </div>

                {/* Film Selector */}
                <div>
                  <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Select Short Film to Watch *
                  </label>
                  {approvedFilms.length > 0 ? (
                    <select
                      value={selectedFilmId}
                      onChange={(e) => setSelectedFilmId(e.target.value)}
                      className="w-full bg-[#0B0C10] border border-gray-700 focus:border-[#FFD60A] rounded-xl p-3 text-[#F5F5F5] outline-none font-semibold"
                    >
                      {approvedFilms.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.title} ({formatDuration(f.duration_sec)}) - {f.director_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[11px] text-yellow-400 italic">No approved films available yet.</p>
                  )}
                </div>

                {/* Film Preview Box */}
                {selectedFilm && (
                  <div className="bg-[#0B0C10] p-3 rounded-xl border border-gray-800 flex items-center gap-3">
                    <img
                      src={selectedFilm.thumbnail_url}
                      alt={selectedFilm.title}
                      className="w-16 h-12 object-cover rounded-lg border border-[#FFD60A]/40 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <span className="font-bold text-[#FFD60A] truncate block text-xs">{selectedFilm.title}</span>
                      <span className="text-[10px] text-gray-400 block truncate">By {selectedFilm.director_name}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-gold w-full font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform"
                >
                  <Tv className="w-4 h-4 text-[#0B0C10]" />
                  <span>Create Watch Party Room</span>
                  <ArrowRight className="w-4 h-4 text-[#0B0C10]" />
                </button>
              </form>
            </div>
          </div>

          {/* JOIN WATCH ROOM VIA CODE CARD */}
          <div className="card-flat p-6 sm:p-8 space-y-6 flex flex-col justify-between border-t-4 border-t-[#F4A300]">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#F4A300]/20 text-[#F4A300] rounded-xl border border-[#F4A300]/40">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#F5F5F5] uppercase tracking-wider">Join Existing Room</h2>
                  <p className="text-[11px] text-gray-400">Enter a 6-character room code sent by your friend.</p>
                </div>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-4 text-xs pt-4">
                <div>
                  <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Room Code / Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value)}
                    placeholder="e.g. ROOM-7X9P"
                    className="w-full bg-[#0B0C10] border border-gray-700 focus:border-[#F4A300] rounded-xl p-3 text-[#F5F5F5] outline-none font-mono uppercase tracking-widest text-sm font-black"
                  />
                </div>

                <div className="bg-[#0B0C10] p-4 rounded-xl border border-gray-800 space-y-2">
                  <span className="text-[10px] font-black text-[#F4A300] uppercase tracking-wider block">
                    ⚡ Quick Join Features
                  </span>
                  <ul className="text-[11px] text-gray-400 space-y-1">
                    <li>• Real-time video player playback sync</li>
                    <li>• Live interactive Chat Box option</li>
                    <li>• One-click invite link sharing</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#F4A300] hover:bg-[#ffb41a] text-[#0B0C10] font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform"
                >
                  <Users className="w-4 h-4 text-[#0B0C10]" />
                  <span>Enter Watch Room</span>
                  <ArrowRight className="w-4 h-4 text-[#0B0C10]" />
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Featured Movies to Start a Watch Party */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-black text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
            <Film className="w-5 h-5 text-[#FFD60A]" />
            <span>Select a Film to Host Now</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedFilms.slice(0, 6).map((film) => (
              <div
                key={film.id}
                onClick={() => {
                  setSelectedFilmId(film.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`card-flat p-3 flex items-center gap-3 cursor-pointer transition-all border ${
                  selectedFilmId === film.id
                    ? 'border-[#FFD60A] bg-[#1F2833]'
                    : 'border-gray-800 hover:border-gray-700 bg-[#0B0C10]'
                }`}
              >
                <img
                  src={film.thumbnail_url}
                  alt={film.title}
                  className="w-20 h-14 object-cover rounded-lg shrink-0 border border-white/10"
                />
                <div className="overflow-hidden">
                  <h4 className="font-bold text-xs text-[#F5F5F5] truncate">{film.title}</h4>
                  <span className="text-[10px] text-gray-400 block">{film.director_name}</span>
                  <span className="text-[10px] text-[#FFD60A] font-bold mt-1 inline-block">
                    {formatDuration(film.duration_sec)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function WatchPartyHubPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
        <div className="text-xs text-gray-400 font-bold animate-pulse">Loading Watch Party Hub...</div>
      </div>
    }>
      <WatchPartyContent />
    </Suspense>
  );
}
