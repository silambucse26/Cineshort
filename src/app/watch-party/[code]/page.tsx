'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Tv, 
  Send, 
  Share2, 
  Copy, 
  Check, 
  MessageSquare, 
  Film, 
  Play, 
  Pause, 
  Sparkles, 
  Crown, 
  Smile, 
  ArrowLeft,
  Settings,
  Eye,
  RefreshCw,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { CinemaVideoPlayer } from '@/components/CinemaVideoPlayer';
import { useShortFilm } from '../../../context/ShortFilmContext';
import { extractYouTubeId } from '../../../utils/youtubeUtils';
import { formatDuration } from '../../../services/driveService';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export default function WatchPartyRoomPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const roomCode = resolvedParams.code.toUpperCase();

  const { films, approvedFilms, activePersona, getFilmById } = useShortFilm();

  // Room state
  const [roomTitle, setRoomTitle] = useState<string>('Collaborative Watch Room');
  const [selectedFilmId, setSelectedFilmId] = useState<string>('');
  const [hostId, setHostId] = useState<string>('');
  const [hostName, setHostName] = useState<string>('Host');
  const [hostOnlyNotice, setHostOnlyNotice] = useState<string | null>(null);

  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isCopiedCode, setIsCopiedCode] = useState(false);

  // Chat box state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'movies' | 'users'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Participants
  const [participants, setParticipants] = useState<{ id: string; name: string; avatar: string }[]>([
    {
      id: activePersona?.id || 'user-1',
      name: activePersona?.name || 'Cinephile',
      avatar: activePersona?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    }
  ]);

  // Host Privilege Check
  const isHost = Boolean(
    (hostId && activePersona?.id && hostId === activePersona.id) ||
    (!hostId && activePersona?.id)
  );

  // Load Room Data from Supabase / localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadRoomState = async () => {
      let fetchedTitle = '';
      let fetchedFilmId = '';
      let fetchedHostId = '';
      let fetchedHostName = '';

      // 1. Fetch from Supabase watch_rooms table first
      if (isSupabaseConfigured) {
        try {
          const { data: roomData } = await supabase
            .from('watch_rooms')
            .select('*')
            .eq('room_code', roomCode)
            .maybeSingle();

          if (roomData) {
            fetchedTitle = roomData.room_title || `Watch Room ${roomCode}`;
            fetchedFilmId = roomData.film_id;
            fetchedHostId = roomData.host_user_id;
            fetchedHostName = roomData.host_user_name || 'Room Host';
          }
        } catch (err) {
          console.warn('Could not query Supabase watch_rooms:', err);
        }
      }

      // 2. Fallback to localStorage if Supabase did not find the room
      if (!fetchedFilmId) {
        const savedRoom = localStorage.getItem(`streamix_room_${roomCode}`);
        if (savedRoom) {
          try {
            const parsed = JSON.parse(savedRoom);
            fetchedTitle = parsed.title || `Watch Room ${roomCode}`;
            fetchedFilmId = parsed.filmId;
            fetchedHostId = parsed.hostId;
            fetchedHostName = parsed.hostName || 'Room Host';
          } catch {}
        }
      }

      // 3. Fallback default setup if visiting room directly without prior data
      if (!fetchedFilmId) {
        const defaultFilm = approvedFilms[0]?.id || films[0]?.id || '';
        fetchedFilmId = defaultFilm;
        fetchedHostId = activePersona?.id || 'user-viewer';
        fetchedHostName = activePersona?.name || 'Party Host';
        fetchedTitle = `Watch Party ${roomCode}`;

        const roomObj = {
          code: roomCode,
          title: fetchedTitle,
          filmId: defaultFilm,
          hostId: fetchedHostId,
          hostName: fetchedHostName,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(`streamix_room_${roomCode}`, JSON.stringify(roomObj));

        if (isSupabaseConfigured) {
          try {
            await supabase.from('watch_rooms').upsert([
              {
                room_code: roomCode,
                room_title: fetchedTitle,
                host_user_id: fetchedHostId,
                host_user_name: fetchedHostName,
                film_id: defaultFilm,
                is_playing: false,
                current_time_sec: 0,
                is_active: true,
              }
            ], { onConflict: 'room_code' });
          } catch {}
        }
      }

      setRoomTitle(fetchedTitle);
      setSelectedFilmId(fetchedFilmId);
      setHostId(fetchedHostId);
      setHostName(fetchedHostName);
    };

    loadRoomState();

    // Load initial chat messages from Supabase or localStorage
    const loadChatMessages = async () => {
      let initialMsgs: ChatMessage[] = [];

      if (isSupabaseConfigured) {
        try {
          const { data: dbMsgs } = await supabase
            .from('watch_room_messages')
            .select('*')
            .eq('room_code', roomCode)
            .order('created_at', { ascending: true })
            .limit(50);

          if (dbMsgs && dbMsgs.length > 0) {
            initialMsgs = dbMsgs.map((m) => ({
              id: m.id,
              senderId: m.user_id,
              senderName: m.user_name,
              senderAvatar: m.user_avatar,
              text: m.message,
              timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSystem: Boolean(m.is_system_msg),
            }));
          }
        } catch {}
      }

      if (initialMsgs.length === 0) {
        const savedMessages = localStorage.getItem(`streamix_messages_${roomCode}`);
        if (savedMessages) {
          try {
            initialMsgs = JSON.parse(savedMessages);
          } catch {}
        }
      }

      if (initialMsgs.length === 0) {
        initialMsgs = [
          {
            id: 'msg-welcome',
            senderId: 'system',
            senderName: 'System',
            text: `Welcome to Watch Room ${roomCode}! Chat live and enjoy real-time movie playback.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
          }
        ];
      }

      setChatMessages(initialMsgs);
    };

    loadChatMessages();
  }, [roomCode, approvedFilms, films, activePersona]);

  // Real-time synchronization via Supabase Realtime & BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Supabase Realtime Subscription
    let supabaseChannel: any = null;
    if (isSupabaseConfigured) {
      supabaseChannel = supabase.channel(`watch_party_${roomCode}`)
        .on('broadcast', { event: 'CHANGE_FILM' }, (payload) => {
          if (payload.payload?.filmId) {
            setSelectedFilmId(payload.payload.filmId);
            setChatMessages((prev) => [
              ...prev,
              {
                id: `sys-${Date.now()}`,
                senderId: 'system',
                senderName: 'System',
                text: `🎬 Movie changed to "${payload.payload.filmTitle}" by room host (${payload.payload.hostName || 'Host'}).`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystem: true,
              }
            ]);
          }
        })
        .on('broadcast', { event: 'CHAT_MSG' }, (payload) => {
          if (payload.payload?.message) {
            const msg = payload.payload.message;
            setChatMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'watch_rooms', filter: `room_code=eq.${roomCode}` }, (payload) => {
          if (payload.new && payload.new.film_id) {
            setSelectedFilmId(payload.new.film_id);
          }
        })
        .subscribe();
    }

    // Fallback Cross-tab BroadcastChannel
    let crossTabChannel: BroadcastChannel | null = null;
    try {
      crossTabChannel = new BroadcastChannel(`watch_party_${roomCode}`);
      crossTabChannel.onmessage = (event) => {
        const data = event.data;
        if (data.type === 'CHAT_MSG') {
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        } else if (data.type === 'CHANGE_FILM') {
          setSelectedFilmId(data.filmId);
          setChatMessages((prev) => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              senderId: 'system',
              senderName: 'System',
              text: `🎬 Movie changed to "${data.filmTitle}" by room host (${data.hostName || 'Host'}).`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSystem: true,
            }
          ]);
        }
      };
    } catch {}

    return () => {
      if (crossTabChannel) crossTabChannel.close();
      if (supabaseChannel) supabase.removeChannel(supabaseChannel);
    };
  }, [roomCode]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Persist messages to localStorage
  useEffect(() => {
    if (chatMessages.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem(`streamix_messages_${roomCode}`, JSON.stringify(chatMessages.slice(-50)));
    }
  }, [chatMessages, roomCode]);

  const currentFilm = getFilmById(selectedFilmId) || films.find(f => f.id === selectedFilmId) || approvedFilms[0];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: activePersona?.id || 'viewer',
      senderName: activePersona?.name || 'Cinephile',
      senderAvatar: activePersona?.avatar,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputMessage('');

    // 1. Broadcast over Supabase Realtime channel & insert into DB
    if (isSupabaseConfigured) {
      try {
        supabase.channel(`watch_party_${roomCode}`).send({
          type: 'broadcast',
          event: 'CHAT_MSG',
          payload: { message: newMsg }
        });

        supabase.from('watch_room_messages').insert([
          {
            room_code: roomCode,
            user_id: newMsg.senderId,
            user_name: newMsg.senderName,
            user_avatar: newMsg.senderAvatar,
            message: text,
            is_system_msg: false,
          }
        ]).then();
      } catch {}
    }

    // 2. Broadcast over local BroadcastChannel
    try {
      const bc = new BroadcastChannel(`watch_party_${roomCode}`);
      bc.postMessage({ type: 'CHAT_MSG', message: newMsg });
      bc.close();
    } catch {}
  };

  const handleHostSelectFilm = async (filmId: string) => {
    // ENFORCE HOST CONTROL PERMISSION
    if (!isHost) {
      const warningText = `Only the room host (${hostName}) has permission to change the movie.`;
      setHostOnlyNotice(warningText);
      setTimeout(() => setHostOnlyNotice(null), 4000);

      const sysNoticeMsg: ChatMessage = {
        id: `sys-denied-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        text: `🔒 Access Denied: Only room host (${hostName}) can change the movie.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      };
      setChatMessages((prev) => [...prev, sysNoticeMsg]);
      return;
    }

    const targetFilm = getFilmById(filmId);
    if (!targetFilm) return;

    setSelectedFilmId(filmId);

    // Save state locally
    const savedRoom = localStorage.getItem(`streamix_room_${roomCode}`);
    if (savedRoom) {
      try {
        const parsed = JSON.parse(savedRoom);
        localStorage.setItem(`streamix_room_${roomCode}`, JSON.stringify({ ...parsed, filmId }));
      } catch {}
    }

    // Update film in Supabase & broadcast real-time event
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('watch_rooms')
          .update({ film_id: filmId, updated_at: new Date().toISOString() })
          .eq('room_code', roomCode);

        supabase.channel(`watch_party_${roomCode}`).send({
          type: 'broadcast',
          event: 'CHANGE_FILM',
          payload: { filmId, filmTitle: targetFilm.title, hostName }
        });
      } catch (err) {
        console.warn('Could not update room film in Supabase:', err);
      }
    }

    // Broadcast cross-tab channel
    try {
      const bc = new BroadcastChannel(`watch_party_${roomCode}`);
      bc.postMessage({ type: 'CHANGE_FILM', filmId, filmTitle: targetFilm.title, hostName });
      bc.close();
    } catch {}

    // System notification message in chat
    const sysMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      text: `🎬 Room host (${hostName}) switched film to "${targetFilm.title}".`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };
    setChatMessages((prev) => [...prev, sysMsg]);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(roomCode);
      setIsCopiedCode(true);
      setTimeout(() => setIsCopiedCode(false), 2000);
    }
  };

  const quickEmojis = ['🍿', '🔥', '❤️', '👏', '😱', '🎉', '😍', '🎬'];

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F5] py-4 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Top Room Header Bar */}
        <div className="card-flat p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#FFD60A]/40 shadow-xl rounded-2xl">
          <div className="flex items-center gap-3">
            <Link
              href="/watch-party"
              className="p-2 bg-[#0B0C10] hover:bg-[#1F2833] text-gray-300 rounded-xl border border-gray-800 transition-colors"
              title="Leave Room"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-[#F5F5F5] uppercase tracking-wide">{roomTitle}</h1>
                <span className="bg-[#FFD60A] text-[#0B0C10] text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  {roomCode}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 flex items-center gap-2">
                <span>Hosted by: <strong className="text-[#FFD60A]">{hostName}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-green-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Room Active
                </span>
              </p>
            </div>
          </div>

          {/* Share Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleCopyCode}
              className="bg-[#0B0C10] hover:bg-black border border-gray-700 text-[#F5F5F5] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Copy 6-character room code"
            >
              {isCopiedCode ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-[#FFD60A]" />}
              <span>{isCopiedCode ? 'Code Copied!' : `Code: ${roomCode}`}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="btn-gold px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-transform"
              title="Copy direct invite link to share with friends"
            >
              {isCopiedLink ? <Check className="w-3.5 h-3.5 text-[#0B0C10]" /> : <Share2 className="w-3.5 h-3.5 text-[#0B0C10]" />}
              <span>{isCopiedLink ? 'Invite Link Copied!' : 'Share Room Link'}</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Video Player (Left/Top) + Live Chat Box (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: SYNCHRONIZED CINEMA PLAYER CONTAINER (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {currentFilm ? (
              <div className="space-y-4">
                <CinemaVideoPlayer
                  filmId={currentFilm.id}
                  videoUrl={currentFilm.video_fallback_url || currentFilm.drive_link}
                  youtubeId={currentFilm.youtube_id || extractYouTubeId(currentFilm.youtube_url || currentFilm.drive_link || '')}
                  youtubeUrl={currentFilm.youtube_url}
                  driveLink={currentFilm.drive_link}
                  poster={currentFilm.thumbnail_url}
                  title={currentFilm.title}
                  overview={currentFilm.overview}
                  videoSource={currentFilm.video_source}
                  durationSec={currentFilm.duration_sec}
                />

                {/* Movie Details Banner */}
                <div className="card-flat p-4 flex items-center justify-between bg-[#1F2833]/40 border border-gray-800">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-[#F5F5F5]">{currentFilm.title}</h3>
                    <p className="text-xs text-gray-400">
                      Director: <strong className="text-[#FFD60A]">{currentFilm.director_name}</strong> • Tag: <span className="uppercase text-red-400 font-bold">{currentFilm.mood_tag}</span>
                    </p>
                  </div>

                  {isHost && (
                    <button
                      onClick={() => setActiveTab('movies')}
                      className="bg-[#FFD60A]/20 border border-[#FFD60A] text-[#FFD60A] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#FFD60A] hover:text-[#0B0C10] transition-colors"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Host: Change Movie</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-[#0B0C10] rounded-2xl border border-gray-800 flex items-center justify-center text-center p-6">
                <div className="space-y-2">
                  <Film className="w-10 h-10 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-400">No movie selected for this watch room.</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: LIVE CHAT BOX & ROOM TABS (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col h-[600px] card-flat overflow-hidden border border-gray-800 shadow-2xl rounded-2xl">
            
            {/* Tab Controls Header */}
            <div className="flex border-b border-gray-800 bg-[#0B0C10]">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === 'chat'
                    ? 'border-[#FFD60A] text-[#FFD60A] bg-[#1F2833]/50'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('movies')}
                className={`flex-1 py-3 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === 'movies'
                    ? 'border-[#FFD60A] text-[#FFD60A] bg-[#1F2833]/50'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Movies</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === 'users'
                    ? 'border-[#FFD60A] text-[#FFD60A] bg-[#1F2833]/50'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Party ({participants.length})</span>
              </button>
            </div>

            {/* TAB 1: LIVE CHAT BOX */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#0B0C10]/95">
                {/* Chat Messages Feed */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                  {chatMessages.map((msg) => (
                    <div key={msg.id}>
                      {msg.isSystem ? (
                        <div className="bg-[#1F2833]/60 border border-gray-800 text-gray-300 text-[11px] p-2.5 rounded-xl text-center font-medium my-1">
                          {msg.text}
                        </div>
                      ) : (
                        <div className="flex items-start gap-2.5">
                          <img
                            src={msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                            alt={msg.senderName}
                            className="w-7 h-7 rounded-full object-cover border border-[#FFD60A]/40 shrink-0 mt-0.5"
                          />
                          <div className="space-y-1 max-w-[85%]">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#FFD60A] text-[11px]">{msg.senderName}</span>
                              {msg.senderId === hostId && (
                                <span className="bg-[#FFD60A]/20 text-[#FFD60A] text-[9px] font-black px-1.5 py-0.5 rounded border border-[#FFD60A]/40">
                                  HOST
                                </span>
                              )}
                              <span className="text-[9px] text-gray-500">{msg.timestamp}</span>
                            </div>
                            <div className="bg-[#1F2833] text-[#F5F5F5] px-3.5 py-2 rounded-2xl rounded-tl-none border border-gray-800 leading-relaxed shadow-sm">
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Emoji Reaction Bar */}
                <div className="px-3 py-1.5 bg-[#0B0C10] border-t border-gray-800 flex items-center gap-1.5 overflow-x-auto">
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSendMessage(emoji)}
                      className="p-1 hover:bg-[#1F2833] rounded-lg text-sm transition-transform active:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 bg-[#0B0C10] border-t border-gray-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message to room..."
                    className="flex-1 bg-[#1F2833] border border-gray-800 focus:border-[#FFD60A] rounded-xl px-3.5 py-2 text-[#F5F5F5] text-xs outline-none font-medium"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-[#FFD60A] hover:bg-[#ffe043] text-[#0B0C10] rounded-xl font-bold transition-transform active:scale-95 shrink-0"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4 fill-current" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: SELECT MOVIE (Host Movie Selector) */}
            {activeTab === 'movies' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B0C10]">
                {/* Host Access Banner */}
                {isHost ? (
                  <div className="bg-[#FFD60A]/10 border border-[#FFD60A]/40 p-3 rounded-xl flex items-center gap-2.5 text-xs text-[#FFD60A] font-bold">
                    <Crown className="w-4 h-4 shrink-0 text-[#FFD60A]" />
                    <span>Host Controls Active — Select a movie to change playback for everyone live.</span>
                  </div>
                ) : (
                  <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-xl flex items-center gap-2.5 text-xs text-red-300 font-semibold">
                    <Lock className="w-4 h-4 shrink-0 text-red-400" />
                    <span>Host Controls Locked — Only Room Host (<strong className="text-[#FFD60A]">{hostName}</strong>) can change the movie.</span>
                  </div>
                )}

                {hostOnlyNotice && (
                  <div className="bg-red-600 text-white text-xs p-2.5 rounded-xl font-extrabold text-center shadow-lg animate-bounce">
                    {hostOnlyNotice}
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-xs font-black uppercase text-[#FFD60A] tracking-wider">
                    Room Film Catalog ({approvedFilms.length})
                  </span>
                  {isHost ? (
                    <span className="text-[10px] bg-green-950 text-green-400 font-bold px-2 py-0.5 rounded border border-green-800 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Host Control Enabled
                    </span>
                  ) : (
                    <span className="text-[10px] bg-red-950 text-red-400 font-bold px-2 py-0.5 rounded border border-red-800 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Member View Only
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {approvedFilms.map((film) => (
                    <div
                      key={film.id}
                      onClick={() => handleHostSelectFilm(film.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        selectedFilmId === film.id
                          ? 'bg-[#1F2833] border-[#FFD60A]'
                          : isHost
                          ? 'bg-[#0B0C10] border-gray-800 hover:border-gray-700 cursor-pointer'
                          : 'bg-[#0B0C10]/60 border-gray-900 cursor-not-allowed opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={film.thumbnail_url}
                          alt={film.title}
                          className="w-12 h-9 object-cover rounded shrink-0 border border-white/10"
                        />
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-xs text-[#F5F5F5] truncate flex items-center gap-1.5">
                            <span>{film.title}</span>
                            {!isHost && selectedFilmId !== film.id && (
                              <Lock className="w-3 h-3 text-gray-500 shrink-0" />
                            )}
                          </h4>
                          <span className="text-[10px] text-gray-400 block">{film.director_name}</span>
                        </div>
                      </div>
                      {selectedFilmId === film.id ? (
                        <span className="text-[10px] font-black text-[#FFD60A] uppercase bg-[#FFD60A]/10 px-2 py-1 rounded border border-[#FFD60A]/30">
                          Now Playing
                        </span>
                      ) : !isHost ? (
                        <span className="text-[9px] font-bold text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PARTY PARTICIPANTS */}
            {activeTab === 'users' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B0C10]">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-xs font-black uppercase text-[#FFD60A] tracking-wider">
                    Room Participants ({participants.length})
                  </span>
                </div>

                <div className="space-y-2">
                  {participants.map((user) => (
                    <div key={user.id} className="p-3 bg-[#1F2833]/50 border border-gray-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#FFD60A]"
                        />
                        <div>
                          <span className="font-bold text-xs text-white block">{user.name}</span>
                          <span className="text-[10px] text-gray-400">Connected</span>
                        </div>
                      </div>

                      {user.id === hostId && (
                        <span className="text-[9px] font-black bg-[#FFD60A] text-[#0B0C10] px-2 py-0.5 rounded">
                          HOST
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
