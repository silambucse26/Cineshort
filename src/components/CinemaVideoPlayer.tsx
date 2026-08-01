'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  RotateCw, 
  Maximize, 
  Minimize, 
  Maximize2,
  Sliders, 
  Sparkles, 
  Tv,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Youtube } from '@/components/YoutubeIcon';
import { extractYouTubeId } from '@/utils/youtubeUtils';
import { getDriveEmbedUrl, isSampleOrInvalidDriveUrl } from '@/utils/googleDriveUtils';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface CinemaVideoPlayerProps {
  videoUrl?: string;
  youtubeId?: string | null;
  youtubeUrl?: string;
  driveLink?: string;
  poster?: string;
  title?: string;
  videoSource?: 'youtube' | 'drive' | 'direct';
  durationSec?: number;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
}

const SAMPLE_FALLBACK_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';

const isPlayableMediaUrl = (url?: string): boolean => {
  if (!url) return false;
  if (url.startsWith('blob:')) return true;
  if (url.includes('drive.google.com') || url.includes('youtube.com') || url.includes('youtu.be')) return false;
  return true;
};

// YouTube IFrame API script loader
const loadYouTubeIframeAPI = (): Promise<any> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return;
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const existing = document.getElementById('youtube-iframe-api');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'youtube-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevReady) prevReady();
      resolve(window.YT);
    };
    const pollInterval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(pollInterval);
        resolve(window.YT);
      }
    }, 100);
  });
};

export const CinemaVideoPlayer: React.FC<CinemaVideoPlayerProps> = ({
  videoUrl,
  youtubeId,
  youtubeUrl,
  driveLink,
  poster,
  title = 'Short Film',
  videoSource,
  durationSec = 120,
  isTheaterMode = false,
  onToggleTheater,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);

  // Generate stable element ID for YouTube player iframe
  const ytDivId = useRef<string>(`yt-player-${Math.random().toString(36).substring(2, 9)}`);

  // Determine actual video type
  const extractedYtId = youtubeId || extractYouTubeId(youtubeUrl || videoUrl || driveLink || '');
  const isYouTube = Boolean(extractedYtId) || videoSource === 'youtube';

  const [forceDirectPlayer, setForceDirectPlayer] = useState(false);

  const isDrive = !isYouTube && (Boolean(driveLink) || (videoUrl && videoUrl.includes('drive.google.com')));
  const isSampleDrive = isDrive && isSampleOrInvalidDriveUrl(driveLink || videoUrl);

  // Check if direct video source (MP4/WebM/Blob)
  const isDirectVideo = !isYouTube && (!isDrive || isSampleDrive || forceDirectPlayer);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSec || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState<'720p' | '1080p' | '4K'>('1080p');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Initial source calculation for HTML5 video
  const getInitialSrc = () => {
    if (isPlayableMediaUrl(videoUrl)) return videoUrl!;
    return SAMPLE_FALLBACK_VIDEO;
  };

  const [activeVideoSrc, setActiveVideoSrc] = useState<string>(getInitialSrc);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize & Manage YouTube IFrame API Player
  useEffect(() => {
    if (!isYouTube || !extractedYtId) return;

    let isMounted = true;
    let ticker: NodeJS.Timeout | null = null;

    loadYouTubeIframeAPI().then((YT) => {
      if (!isMounted) return;

      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        try { ytPlayerRef.current.destroy(); } catch {}
      }

      const targetElem = document.getElementById(ytDivId.current);
      if (!targetElem) return;

      ytPlayerRef.current = new YT.Player(ytDivId.current, {
        videoId: extractedYtId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: (event: any) => {
            if (!isMounted) return;
            try {
              const dur = event.target.getDuration();
              if (dur && dur > 0) setDuration(dur);
              event.target.playVideo();
              setIsPlaying(true);
            } catch {}
          },
          onStateChange: (event: any) => {
            if (!isMounted) return;
            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          },
        },
      });

      // Ticker for current time and duration sync
      ticker = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          try {
            const curr = ytPlayerRef.current.getCurrentTime() || 0;
            const dur = ytPlayerRef.current.getDuration() || durationSec || 0;
            setCurrentTime(curr);
            if (dur > 0) setDuration(dur);
          } catch {}
        }
      }, 250);
    });

    return () => {
      isMounted = false;
      if (ticker) clearInterval(ticker);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        try { ytPlayerRef.current.destroy(); } catch {}
      }
    };
  }, [isYouTube, extractedYtId, durationSec]);

  // Sync activeVideoSrc when videoUrl changes for direct videos
  useEffect(() => {
    if (isDirectVideo) {
      if (isPlayableMediaUrl(videoUrl)) {
        setActiveVideoSrc(videoUrl!);
      } else {
        setActiveVideoSrc(SAMPLE_FALLBACK_VIDEO);
      }
    }
  }, [videoUrl, isDirectVideo]);

  // HTML5 Video element event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isDirectVideo) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration || durationSec || 0);
      setVideoError(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      if (activeVideoSrc !== SAMPLE_FALLBACK_VIDEO) {
        setVideoError(true);
        setActiveVideoSrc(SAMPLE_FALLBACK_VIDEO);
        if (videoRef.current) videoRef.current.load();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [isDirectVideo, durationSec, activeVideoSrc]);

  // Unified Play/Pause Handler for BOTH YouTube and Direct HTML5 Videos
  const togglePlay = () => {
    if (isYouTube && ytPlayerRef.current) {
      try {
        if (isPlaying) {
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        }
      } catch {}
      return;
    }

    if (isDirectVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        if (!activeVideoSrc || !isPlayableMediaUrl(activeVideoSrc) || videoRef.current.error) {
          setActiveVideoSrc(SAMPLE_FALLBACK_VIDEO);
          videoRef.current.load();
        }
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setVideoError(false);
            })
            .catch(() => {
              if (videoRef.current) {
                videoRef.current.muted = true;
                setIsMuted(true);
                videoRef.current.play().then(() => {
                  setIsPlaying(true);
                  setVideoError(false);
                }).catch(() => {});
              }
            });
        }
      }
    }
  };

  // Unified Seek Handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);

    if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try { ytPlayerRef.current.seekTo(newTime, true); } catch {}
    } else if (isDirectVideo && videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Unified Skip 10s Handler
  const handleSkip = (seconds: number) => {
    const target = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(target);

    if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try { ytPlayerRef.current.seekTo(target, true); } catch {}
    } else if (isDirectVideo && videoRef.current) {
      videoRef.current.currentTime = target;
    }
  };

  // Unified Volume Handler
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);

    if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try {
        ytPlayerRef.current.setVolume(val * 100);
        if (val === 0) ytPlayerRef.current.mute();
        else ytPlayerRef.current.unMute();
      } catch {}
    } else if (isDirectVideo && videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  // Unified Mute Toggle
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);

    if (isYouTube && ytPlayerRef.current) {
      try {
        if (nextMute) ytPlayerRef.current.mute();
        else ytPlayerRef.current.unMute();
      } catch {}
    } else if (isDirectVideo && videoRef.current) {
      videoRef.current.muted = nextMute;
    }
  };

  // Unified Playback Speed Handler
  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);

    if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackRate === 'function') {
      try { ytPlayerRef.current.setPlaybackRate(speed); } catch {}
    } else if (isDirectVideo && videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Mouse Move Control Hiding
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  // Format Time (e.g., 01:02)
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`card-flat overflow-hidden border-2 border-[#FFD60A]/40 shadow-[0_0_30px_rgba(255,214,10,0.15)] relative rounded-2xl bg-black group transition-all ${
        isTheaterMode ? 'w-full max-w-full' : ''
      } ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen border-0 rounded-none' : ''
      }`}
    >
      <div className={`bg-black w-full relative flex items-center justify-center overflow-hidden ${
        isFullscreen ? 'h-[calc(100vh-80px)]' : 'aspect-video'
      }`}>
        {/* YouTube Stream Mode via YouTube IFrame Player API (Controls = 0) */}
        {isYouTube && extractedYtId ? (
          <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
            {/* The element where YouTube API injects clean, control-free iframe */}
            {/* Wrapper to scale and crop out YouTube logo/title */}
            <div className={`absolute pointer-events-none overflow-hidden flex items-center justify-center ${
              isFullscreen 
                ? 'w-[160%] h-[160%] -top-[30%] -left-[30%] md:w-[116%] md:h-[116%] md:-top-[8%] md:-left-[8%]' 
                : 'w-[116%] h-[116%] -top-[8%] -left-[8%]'
            }`}>
              <div id={ytDivId.current} className="w-full h-full pointer-events-none" />
            </div>

            {/* Clickable Overlay to Toggle Play/Pause on YouTube Video */}
            <div 
              className="absolute inset-0 z-20 cursor-pointer"
              onClick={togglePlay}
            />

            {/* Big Center Play/Pause Overlay */}
            {(!isPlaying || showControls) && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-[#FFD60A] hover:bg-[#ffe043] text-[#0B0C10] flex items-center justify-center shadow-[0_0_35px_rgba(255,214,10,0.9)] transition-all transform hover:scale-110 active:scale-95 z-30"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 fill-current" />
                ) : (
                  <Play className="w-10 h-10 fill-current ml-1.5" />
                )}
              </button>
            )}
          </div>
        ) : isDrive && !isSampleDrive ? (
          /* Google Drive Stream Mode */
          <iframe
            src={getDriveEmbedUrl(driveLink || videoUrl || '')}
            title={title}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          /* Custom Application-Controlled HTML5 Video Player */
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src={activeVideoSrc}
              poster={poster}
              preload="auto"
              playsInline
              className={`w-full h-full cursor-pointer ${
                isFullscreen ? 'object-cover md:object-contain' : 'object-contain'
              }`}
              onClick={togglePlay}
            />

            {/* Error Notification Overlay */}
            {videoError && (
              <div className="absolute top-4 right-4 bg-yellow-950/90 text-[#FFD60A] border border-[#FFD60A]/60 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 backdrop-blur-md shadow-lg z-20 font-bold">
                <AlertTriangle className="w-4 h-4 text-[#FFD60A]" />
                <span>Custom stream link unavailable. Active video updated to HD Cinema stream.</span>
              </div>
            )}

            {/* Big Center Play/Pause Overlay */}
            {(!isPlaying || showControls) && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-[#FFD60A] hover:bg-[#ffe043] text-[#0B0C10] flex items-center justify-center shadow-[0_0_35px_rgba(255,214,10,0.9)] transition-all transform hover:scale-110 active:scale-95 z-10"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 fill-current" />
                ) : (
                  <Play className="w-10 h-10 fill-current ml-1.5" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Yellow Application Control Bar (Active for BOTH YouTube & Direct Videos) */}
      <div className="bg-[#0B0C10] px-4 py-3 border-t border-[#FFD60A]/40 flex flex-col gap-2.5 text-xs select-none">
        {/* Custom Yellow Progress Bar (Works for YouTube and Direct Videos) */}
        {!isDrive || isSampleDrive ? (
          <div className="flex items-center gap-3 w-full">
            <span className="text-[#FFD60A] font-mono font-bold text-xs">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 flex items-center group/scrub">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FFD60A] hover:h-2 transition-all"
              />
              <div 
                className="absolute left-0 top-0 bottom-0 bg-[#FFD60A] rounded-lg pointer-events-none shadow-[0_0_10px_#FFD60A]"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="text-gray-400 font-mono font-bold text-xs">
              {formatTime(duration)}
            </span>
          </div>
        ) : null}

        {/* Control Buttons & Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Stream Source Badge & Interactive Yellow Playback Buttons */}
          <div className="flex items-center gap-2.5">
            {isYouTube ? (
              <span className="inline-flex items-center gap-1.5 bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/40 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider shadow-[0_0_8px_rgba(255,214,10,0.2)]">
                <Youtube className="w-3.5 h-3.5 text-[#FFD60A]" /> YouTube Cinema Stream
              </span>
            ) : isDrive && !isSampleDrive ? (
              <span className="inline-flex items-center gap-1.5 bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/40 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider">
                <Tv className="w-3.5 h-3.5 text-[#FFD60A]" /> Google Drive Stream
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-[#FFD60A]/20 text-[#FFD60A] border border-[#FFD60A]/60 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(255,214,10,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD60A]" /> App Controlled Stream
              </span>
            )}

            {/* Application Interactive Controls (Play/Pause, Skip 10s, Volume Slider) */}
            {(!isDrive || isSampleDrive) && (
              <div className="flex items-center gap-1 bg-[#1F2833] border border-[#FFD60A]/30 p-1 rounded-lg">
                <button
                  onClick={togglePlay}
                  className="p-1 hover:bg-[#FFD60A] hover:text-[#0B0C10] text-[#FFD60A] rounded transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleSkip(-10)}
                  className="p-1 hover:bg-[#FFD60A] hover:text-[#0B0C10] text-gray-300 rounded transition-colors"
                  title="Rewind 10s"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleSkip(10)}
                  className="p-1 hover:bg-[#FFD60A] hover:text-[#0B0C10] text-gray-300 rounded transition-colors"
                  title="Forward 10s"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* Volume Controls */}
                <div className="flex items-center gap-1 pl-1 border-l border-gray-700">
                  <button
                    onClick={toggleMute}
                    className="p-1 hover:bg-[#FFD60A] hover:text-[#0B0C10] text-gray-300 rounded transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#FFD60A]" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-14 h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-[#FFD60A]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Yellow Quality, Speed, Theater & Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Speed Selector (for YouTube and Direct Videos) */}
            {(!isDrive || isSampleDrive) && (
              <div className="flex items-center gap-0.5 bg-[#1F2833] p-0.5 rounded-md border border-[#FFD60A]/30 text-[10px] font-bold">
                {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-1.5 py-0.5 rounded transition-all ${
                      playbackRate === spd
                        ? 'bg-[#FFD60A] text-[#0B0C10] font-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            )}

            {/* Quality Selector */}
            <div className="flex items-center gap-1 bg-[#1F2833] p-0.5 rounded-md border border-[#FFD60A]/30 text-[10px] font-bold">
              <Sliders className="w-3 h-3 text-[#FFD60A] ml-1.5" />
              {(['720p', '1080p', '4K'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`px-2 py-0.5 rounded transition-all ${
                    quality === q
                      ? 'bg-[#FFD60A] text-[#0B0C10] font-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Drive / Cinema HD Stream Mode Switcher */}
            {isDrive && (
              <button
                onClick={() => setForceDirectPlayer(!forceDirectPlayer)}
                className="bg-[#1F2833] hover:bg-[#FFD60A] hover:text-[#0B0C10] text-[#FFD60A] border border-[#FFD60A]/40 px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all"
                title="Switch between Drive Embed and App-Controlled Cinema Stream"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>{forceDirectPlayer ? 'Drive Embed' : 'App Control'}</span>
              </button>
            )}

            {/* Theater Mode Toggle */}
            {onToggleTheater && (
              <button
                onClick={onToggleTheater}
                className="bg-[#1F2833] hover:bg-[#FFD60A] hover:text-[#0B0C10] text-[#FFD60A] border border-[#FFD60A]/40 px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all"
                title="Toggle Theater Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Theater</span>
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="bg-[#1F2833] hover:bg-[#FFD60A] hover:text-[#0B0C10] text-[#FFD60A] border border-[#FFD60A]/40 p-1 rounded-md text-[11px] font-bold transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinemaVideoPlayer;
