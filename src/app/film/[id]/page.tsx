'use client';

import React, { useState, use, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  Star, 
  Clock, 
  User, 
  Share2, 
  MessageSquare, 
  CheckCircle2, 
  Send, 
  Eye, 
  ThumbsUp, 
  Sparkles,
  Award,
  Tv,
  Maximize2,
  Sliders,
  Lock,
  LogIn,
  Trash2,
  Bookmark,
  Users
} from 'lucide-react';
import { CinemaVideoPlayer } from '@/components/CinemaVideoPlayer';
import { MovieJudgeInsightModal } from '@/components/MovieJudgeInsightModal';
import { useShortFilm } from '../../../context/ShortFilmContext';
import { FilmCard } from '../../../components/FilmCard';
import { formatDuration } from '../../../services/driveService';
import { isSampleOrInvalidDriveUrl, getDriveEmbedUrl } from '../../../utils/googleDriveUtils';
import { getYouTubeEmbedUrl, extractYouTubeId } from '../../../utils/youtubeUtils';

export default function FilmPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const filmId = resolvedParams.id;

  const {
    getFilmById,
    getCommentsForFilm,
    films,
    rateFilm,
    addComment,
    deleteFilm,
    userRatings,
    activePersona,
    incrementViews,
    toggleWishlist,
    isInWishlist,
  } = useShortFilm();

  const film = getFilmById(filmId);
  const comments = getCommentsForFilm(filmId);

  const hasIncremented = useRef(false);
  useEffect(() => {
    if (filmId && !hasIncremented.current) {
      hasIncremented.current = true;
      incrementViews(filmId);
    }
  }, [filmId, incrementViews]);

  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentText, setCommentText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [useFallbackPlayer, setUseFallbackPlayer] = useState(false);
  const [qualityMode, setQualityMode] = useState<'1080p' | '4K' | '720p'>('1080p');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);

  if (!film) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-center p-6">
        <div className="card-flat p-8 max-w-md space-y-4">
          <h2 className="text-xl font-bold text-[#F5F5F5]">Short Film Not Found</h2>
          <p className="text-xs text-gray-400">The requested film may have been removed or does not exist.</p>
          <Link href="/" className="btn-gold text-xs px-4 py-2 inline-block">
            Back to Home Feed
          </Link>
        </div>
      </div>
    );
  }

  const ytId = film.youtube_id || extractYouTubeId(film.youtube_url || film.drive_link || '');
  const isYouTube = Boolean(ytId) || film.video_source === 'youtube';

  const isSampleDrive = isSampleOrInvalidDriveUrl(film.drive_link);
  const shouldShowFallback = useFallbackPlayer || (isSampleDrive && !isYouTube) || (!film.drive_link && !isYouTube);

  const currentUserRating = userRatings[film.id] || 0;

  // Format running time for display in yellow
  const mins = Math.floor(film.duration_sec / 60);
  const secs = film.duration_sec % 60;
  const formattedRunningTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const moreLikeThis = films
    .filter((f) => f.mood_tag === film.mood_tag && f.id !== film.id)
    .slice(0, 4);

  const handleRate = (stars: number) => {
    rateFilm(film.id, stars);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(film.id, commentText);
    setCommentText('');
  };

  const handleCopyShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleAdminDelete = () => {
    if (window.confirm(`Admin: Are you sure you want to permanently delete "${film.title}" from the database?`)) {
      deleteFilm(film.id);
      router.push('/');
    }
  };

  return (
    <div className={`min-h-screen bg-[#0B0C10] text-[#F5F5F5] py-6 px-4 sm:px-6 lg:px-8 transition-all ${isTheaterMode ? 'max-w-full' : ''}`}>
      <div className={`${isTheaterMode ? 'w-full' : 'max-w-6xl'} mx-auto space-y-6 transition-all`}>
        {/* Top Breadcrumb & Source Badge */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <Link href="/" className="hover:text-[#FFD60A] transition-colors flex items-center gap-1 font-semibold">
            ← Back to Feed
          </Link>
          <div className="flex items-center gap-2">
            {activePersona?.role === 'admin' && (
              <button
                onClick={handleAdminDelete}
                className="bg-[#E63946]/20 hover:bg-[#E63946] border border-[#E63946]/50 text-red-400 hover:text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Delete Film from Database"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Admin Delete</span>
              </button>
            )}
            <span className="tag-red font-bold text-[10px] uppercase">{film.mood_tag}</span>
          </div>
        </div>

        {/* Cinema Video Player Container with Custom Yellow Application Controls */}
        {activePersona?.email ? (
          <CinemaVideoPlayer
            filmId={film.id}
            videoUrl={film.video_fallback_url || film.drive_link}
            youtubeId={ytId}
            youtubeUrl={film.youtube_url}
            driveLink={film.drive_link}
            poster={film.thumbnail_url}
            title={film.title}
            overview={film.overview}
            videoSource={film.video_source}
            durationSec={film.duration_sec}
            isTheaterMode={isTheaterMode}
            onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
            onFilmComplete={() => setIsJudgeModalOpen(true)}
          />
        ) : (
          <div className="card-flat overflow-hidden border-2 border-[#FFD60A]/40 shadow-[0_0_30px_rgba(255,214,10,0.15)] relative rounded-2xl aspect-video bg-black flex items-center justify-center group">
            {/* Background Thumbnail Image with Blur */}
            <img 
              src={film.thumbnail_url} 
              alt={film.title}
              className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 select-none pointer-events-none" 
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />

            {/* Glassmorphic Login Call-to-Action Card */}
            <div className="relative z-10 max-w-sm mx-auto text-center p-6 sm:p-8 rounded-2xl bg-[#1F2833]/70 border border-white/10 backdrop-blur-md shadow-2xl space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#FFD60A]/20 border border-[#FFD60A]/50 text-[#FFD60A] flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(255,214,10,0.3)] animate-pulse">
                <Lock className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-md font-black text-[#F5F5F5] uppercase tracking-wider">Premium Content Protected</h3>
                <p className="text-[11px] text-gray-300">
                  Please log in to watch <strong className="text-[#FFD60A] font-bold">{film.title}</strong> and unlock reviews, ratings, and director details.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href={`/login?redirect=/film/${film.id}`}
                  className="btn-gold text-xs px-5 py-3 font-extrabold flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-transform duration-150"
                >
                  <LogIn className="w-4 h-4 text-[#0B0C10]" />
                  <span>Log In to Watch</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Film Title, Metadata & Actions Row */}
        <div className="card-flat p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-700/50 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] mb-2">{film.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <Link
                  href={`/director/${film.director_id}`}
                  className="flex items-center gap-2 font-bold text-[#FFD60A] hover:underline"
                >
                  <User className="w-4 h-4" />
                  <span>Director: {film.director_name}</span>
                </Link>

                {film.hero_names.length > 0 && (
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Award className="w-4 h-4 text-[#FFD60A]" />
                    <span>Cast: <strong>{film.hero_names.join(', ')}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Share, Wishlist & Watch Party Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="text-right text-xs text-gray-400 hidden lg:block mr-2">
                <div className="flex items-center gap-1 text-[#F5F5F5] font-bold text-sm">
                  <Eye className="w-4 h-4 text-[#FFD60A]" />
                  <span>{(film.views_count ?? 0).toLocaleString()} {(film.views_count ?? 0) === 1 ? 'view' : 'views'}</span>
                </div>
                <span>Uploaded {film.upload_date}</span>
              </div>

              <button
                onClick={() => toggleWishlist(film.id)}
                className={`border px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                  isInWishlist(film.id)
                    ? 'bg-red-600/90 text-white border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : 'bg-[#0B0C10] hover:bg-black border-gray-700 text-[#F5F5F5]'
                }`}
                title={isInWishlist(film.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Bookmark className={`w-4 h-4 ${isInWishlist(film.id) ? 'fill-current' : 'text-[#FFD60A]'}`} />
                <span>{isInWishlist(film.id) ? 'Wishlisted' : 'Wishlist'}</span>
              </button>

              <button
                onClick={() => setIsJudgeModalOpen(true)}
                className="bg-[#2A2315] hover:bg-[#382f1d] border border-[#FFD60A]/50 text-[#FFD60A] px-3.5 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-transform active:scale-95 shadow-md"
                title="Score this movie as a Jury Judge and generate AI Insights"
              >
                <Award className="w-4 h-4 text-[#FFD60A]" />
                <span>Judge & AI Insights</span>
              </button>

              <Link
                href={`/watch-party?filmId=${film.id}`}
                className="bg-[#FFD60A] hover:bg-[#ffe043] text-[#0B0C10] px-3.5 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-transform active:scale-95 shadow-[0_0_15px_rgba(255,214,10,0.3)]"
                title="Create a Collaborative Watch Room"
              >
                <Users className="w-4 h-4 text-[#0B0C10]" />
                <span>Watch Together</span>
              </Link>

              <button
                onClick={handleCopyShare}
                className="bg-[#0B0C10] hover:bg-[#0B0C10]/80 border border-gray-700 text-[#F5F5F5] px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4 text-[#FFD60A]" />
                <span>{isCopied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Synopsis */}
          {film.overview && film.overview !== 'Short film uploaded via Admin Management Panel.' && (
            <div>
              <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Synopsis</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{film.overview}</p>
            </div>
          )}

          {/* Interactive Star Rating Control (Yellow Accents) */}
          <div className="bg-[#0B0C10] p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                Rate this Short Film
              </span>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black text-[#FFD60A]">★ {film.rating_avg.toFixed(1)}</span>
                <span className="text-xs text-gray-400 ml-1">({film.rating_count} ratings)</span>
              </div>
            </div>

            {/* Tap to Rate 5 Stars */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || currentUserRating) >= star
                        ? 'text-[#FFD60A] fill-[#FFD60A]'
                        : 'text-gray-600 hover:text-gray-400'
                    }`}
                  />
                </button>
              ))}
              {currentUserRating > 0 && (
                <span className="text-xs text-[#FFD60A] font-bold ml-2">
                  Your rating: {currentUserRating} ★
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Comment Section (Verified Badges) */}
        <div className="card-flat p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-700/50 pb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#FFD60A]" />
              <h2 className="font-extrabold text-base sm:text-lg text-[#F5F5F5]">Verified Comments</h2>
              <span className="text-xs text-gray-400">({comments.length})</span>
            </div>

            {/* Active Persona badge */}
            <div className="text-xs text-gray-400 flex flex-wrap items-center gap-1.5 bg-[#0B0C10]/60 p-2 sm:p-0 rounded-lg sm:bg-transparent border sm:border-0 border-gray-800">
              <span>Posting as:</span>
              <span className="font-bold text-[#FFD60A]">{activePersona.name}</span>
              {activePersona.is_verified && (
                <span className="badge-amber text-[9px] py-0.5 px-2 rounded-md">Verified {activePersona.role}</span>
              )}
            </div>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <div className="flex items-center gap-2.5 sm:block shrink-0">
                <img
                  src={activePersona.avatar}
                  alt={activePersona.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#FFD60A]"
                />
                <span className="sm:hidden text-xs font-bold text-[#F5F5F5]">{activePersona.name}</span>
              </div>
              <div className="w-full space-y-2.5">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    activePersona.is_verified
                      ? `Post verified feedback as ${activePersona.role} ${activePersona.name}...`
                      : 'Share your critique or feedback...'
                  }
                  rows={3}
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-xl p-3 text-xs text-[#F5F5F5] placeholder-gray-500 focus:outline-none focus:border-[#FFD60A] transition-colors"
                />
                <div className="flex justify-end">
                  <button type="submit" className="btn-gold text-xs px-5 py-2.5 flex items-center gap-1.5 rounded-xl font-bold shadow-md hover:scale-105 active:scale-95 transition-transform">
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Comment</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4 pt-2">
            {comments.map((comm) => (
              <div
                key={comm.id}
                className="bg-[#0B0C10] p-4 rounded-xl border border-gray-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={comm.user_avatar}
                      alt={comm.user_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#F5F5F5]">{comm.user_name}</span>
                        {comm.is_verified && (
                          <span className="bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/40 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified {comm.user_role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">{comm.timestamp}</span>
                </div>
                <p className="text-xs text-gray-300 pl-10 leading-relaxed">{comm.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* "More Like This" Section */}
        {moreLikeThis.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-[#F5F5F5] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFD60A]" />
                More Shorts Like This ({film.mood_tag})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {moreLikeThis.map((f) => (
                <FilmCard key={f.id} film={f} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Movie Completion & Jury Judge AI Insight Suite Modal */}
      <MovieJudgeInsightModal
        film={film}
        isOpen={isJudgeModalOpen}
        onClose={() => setIsJudgeModalOpen(false)}
      />
    </div>
  );
}
