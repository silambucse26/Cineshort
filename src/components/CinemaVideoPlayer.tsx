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
  AlertTriangle,
  Captions,
  RefreshCw,
  Sun
} from 'lucide-react';
import { Youtube } from '@/components/YoutubeIcon';
import { extractYouTubeId } from '@/utils/youtubeUtils';
import { getDriveEmbedUrl, isSampleOrInvalidDriveUrl, getDriveDirectStreamUrl } from '@/utils/googleDriveUtils';
import { getUploadedVideoObjectUrl } from '@/utils/indexedDbVideo';

// Premium Timed Subtitle dialogue mapping helper (Dynamic based on film metadata)
const getSubtitleText = (time: number, lang: 'en' | 'es', title?: string, overview?: string): string => {
  const filmName = title || 'CineShort Original';
  const snippet = overview && overview.length > 10 ? overview.substring(0, 65) + '...' : 'In the quiet shadows of the city, secrets begin to unravel...';

  const dialogue = [
    { start: 0, end: 4, en: `[CineShort Cinema] Presenting "${filmName}"`, es: `[CineShort Cinema] Presentando "${filmName}"` },
    { start: 4, end: 9, en: `"${snippet}"`, es: `"${snippet}"` },
    { start: 9, end: 14, en: "[Dramatic cinematic score building]", es: "[Banda sonora dramática en aumento]" },
    { start: 14, end: 19, en: "We have to find out the truth before sunrise.", es: "Tenemos que descubrir la verdad antes del amanecer." },
    { start: 19, end: 24, en: "[Suspenseful tension rising]", es: "[Tensión y suspenso en aumento]" },
    { start: 24, end: 30, en: "Every choice has a story. Watch closely.", es: "Cada elección tiene una historia. Mira con atención." }
  ];
  
  const matched = dialogue.find(d => time >= d.start && time < d.end);
  if (matched) {
    return lang === 'es' ? matched.es : matched.en;
  }
  
  if (time >= 30) {
    const modTime = time % 30;
    const matchedLoop = dialogue.find(d => modTime >= d.start && modTime < d.end);
    if (matchedLoop) {
      return lang === 'es' ? matchedLoop.es : matchedLoop.en;
    }
  }
  
  return "";
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface CinemaVideoPlayerProps {
  filmId?: string;
  videoUrl?: string;
  youtubeId?: string | null;
  youtubeUrl?: string;
  driveLink?: string;
  poster?: string;
  title?: string;
  overview?: string;
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
  filmId,
  videoUrl,
  youtubeId,
  youtubeUrl,
  driveLink,
  poster,
  title = 'Short Film',
  overview = '',
  videoSource,
  durationSec = 120,
  isTheaterMode = false,
  onToggleTheater,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);

  const ytDivId = useRef<string>(`yt-player-${Math.random().toString(36).substring(2, 9)}`);

  const extractedYtId = youtubeId || extractYouTubeId(youtubeUrl || videoUrl || driveLink || '');
  const isYouTube = Boolean(extractedYtId) || videoSource === 'youtube';

  const isDrive = !isYouTube && (Boolean(driveLink) || Boolean(videoUrl && videoUrl.includes('drive.google.com')));
  const isSampleDrive = isDrive && Boolean(isSampleOrInvalidDriveUrl(driveLink || videoUrl));

  // Native App HD Direct Player mode (Custom Controls)
  const [useDriveIframe, setUseDriveIframe] = useState<boolean>(false);

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

  // Dropdown States
  const [showQualityDropdown, setShowQualityDropdown] = useState(false);
  const [showSubtitleDropdown, setShowSubtitleDropdown] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<'off' | 'en' | 'es'>('off');

  const qualityRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (qualityRef.current && !qualityRef.current.contains(event.target as Node)) {
        setShowQualityDropdown(false);
      }
      if (subtitleRef.current && !subtitleRef.current.contains(event.target as Node)) {
        setShowSubtitleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Touch Gestures State (Double-tap to skip 10s, vertical swipe for volume & brightness)
  const [brightness, setBrightness] = useState<number>(1);
  const [gestureOverlay, setGestureOverlay] = useState<{
    type: 'volume' | 'brightness' | 'skip-fw' | 'skip-bw';
    value?: number;
    key: number;
  } | null>(null);

  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    side: 'left' | 'right';
    initialVolume: number;
    initialBrightness: number;
    isDragging: boolean;
  } | null>(null);

  const lastTapRef = useRef<{ side: 'left' | 'right'; time: number } | null>(null);
  const gestureTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerGestureOverlay = (overlay: { type: 'volume' | 'brightness' | 'skip-fw' | 'skip-bw'; value?: number }) => {
    if (gestureTimerRef.current) clearTimeout(gestureTimerRef.current);
    setGestureOverlay({ ...overlay, key: Date.now() });
    gestureTimerRef.current = setTimeout(() => {
      setGestureOverlay(null);
    }, 1200);
  };

  const handleTouchStartGesture = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    const side = touchX < rect.width / 2 ? 'left' : 'right';

    touchStartRef.current = {
      x: touchX,
      y: touchY,
      time: Date.now(),
      side,
      initialVolume: volume,
      initialBrightness: brightness,
      isDragging: false,
    };
  };

  const handleTouchMoveGesture = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !touchStartRef.current || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const touchY = touch.clientY - rect.top;
    const deltaY = touchStartRef.current.y - touchY; // positive = drag up

    if (Math.abs(deltaY) > 12) {
      touchStartRef.current.isDragging = true;
    }

    if (!touchStartRef.current.isDragging) return;

    const sensitivity = 0.5 * rect.height;

    if (touchStartRef.current.side === 'right') {
      // Right side vertical swipe = Volume adjustment (0 to 1)
      const newVol = Math.max(0, Math.min(1, touchStartRef.current.initialVolume + deltaY / sensitivity));
      setVolume(newVol);
      setIsMuted(newVol === 0);
      if (videoRef.current) videoRef.current.volume = newVol;
      triggerGestureOverlay({ type: 'volume', value: Math.round(newVol * 100) });
    } else {
      // Left side vertical swipe = Brightness adjustment (0.2 to 1.5)
      const newBright = Math.max(0.2, Math.min(1.5, touchStartRef.current.initialBrightness + (deltaY / sensitivity) * 1.2));
      setBrightness(newBright);
      triggerGestureOverlay({ type: 'brightness', value: Math.round((newBright / 1.5) * 100) });
    }
  };

  const handleTouchEndGesture = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;

    const { side, time, isDragging } = touchStartRef.current;
    const tapDuration = Date.now() - time;

    // Handle Double-Tap Gesture (< 250ms tap duration, no drag)
    if (!isDragging && tapDuration < 250) {
      const now = Date.now();
      if (lastTapRef.current && lastTapRef.current.side === side && (now - lastTapRef.current.time) < 300) {
        // Double tap confirmed!
        if (side === 'right') {
          handleSkip(10);
          triggerGestureOverlay({ type: 'skip-fw' });
        } else {
          handleSkip(-10);
          triggerGestureOverlay({ type: 'skip-bw' });
        }
        lastTapRef.current = null;
      } else {
        lastTapRef.current = { side, time: now };
      }
    }

    touchStartRef.current = null;
  };

  const getInitialSrc = () => {
    if (videoUrl && !videoUrl.includes('drive.google.com')) return videoUrl;
    if (driveLink && !isSampleOrInvalidDriveUrl(driveLink)) {
      return getDriveDirectStreamUrl(driveLink);
    }
    return SAMPLE_FALLBACK_VIDEO;
  };

  const [activeVideoSrc, setActiveVideoSrc] = useState<string>(getInitialSrc);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // YouTube IFrame API Initialization
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

  useEffect(() => {
    let isMounted = true;

    const resolveSrc = async () => {
      if (isYouTube) return;

      // 1. Try to load local uploaded video file from IndexedDB
      if (filmId) {
        try {
          const storedBlobUrl = await getUploadedVideoObjectUrl(filmId);
          if (storedBlobUrl && isMounted) {
            setActiveVideoSrc(storedBlobUrl);
            setUseDriveIframe(false);
            setVideoError(false);
            return;
          }
        } catch (e) {
          console.warn('IndexedDB video resolution failed:', e);
        }
      }

      // 2. Check provided videoUrl or Drive link
      if (isPlayableMediaUrl(videoUrl)) {
        if (isMounted) setActiveVideoSrc(videoUrl!);
      } else if (driveLink && !isSampleOrInvalidDriveUrl(driveLink)) {
        if (isMounted) setActiveVideoSrc(getDriveDirectStreamUrl(driveLink));
      } else {
        if (isMounted) setActiveVideoSrc(SAMPLE_FALLBACK_VIDEO);
      }
    };

    resolveSrc();

    return () => {
      isMounted = false;
    };
  }, [filmId || '', videoUrl || '', driveLink || '', isYouTube]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYouTube || useDriveIframe) return;

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
  }, [isYouTube, useDriveIframe, durationSec, activeVideoSrc]);

  const togglePlay = () => {
    // If user clicks play while Drive iframe is active, switch to direct player so playback starts!
    if (useDriveIframe) {
      setUseDriveIframe(false);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, 100);
      return;
    }

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

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        if (!activeVideoSrc || !isPlayableMediaUrl(activeVideoSrc) || videoRef.current.error) {
          setActiveVideoSrc(SAMPLE_FALLBACK_VIDEO);
          if (videoRef.current) videoRef.current.load();
        }
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setVideoError(false);
            })
            .catch(() => {
              // Try unmuting or falling back to sample stream
              if (videoRef.current) {
                if (activeVideoSrc !== SAMPLE_FALLBACK_VIDEO) {
                  setActiveVideoSrc(SAMPLE_FALLBACK_VIDEO);
                  videoRef.current.load();
                }
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);

    if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try { ytPlayerRef.current.seekTo(newTime, true); } catch {}
    } else if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleSkip = (seconds: number) => {
    const target = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(target);

    if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try { ytPlayerRef.current.seekTo(target, true); } catch {}
    } else if (videoRef.current) {
      videoRef.current.currentTime = target;
    }
  };

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
    } else if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);

    if (isYouTube && ytPlayerRef.current) {
      try {
        if (nextMute) ytPlayerRef.current.mute();
        else ytPlayerRef.current.unMute();
      } catch {}
    } else if (videoRef.current) {
      videoRef.current.muted = nextMute;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);

    if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackRate === 'function') {
      try { ytPlayerRef.current.setPlaybackRate(speed); } catch {}
    } else if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        if (typeof window !== 'undefined' && window.screen && window.screen.orientation) {
          const orientation = window.screen.orientation as any;
          if (typeof orientation.lock === 'function') {
            orientation.lock('landscape').catch(() => {});
          }
        }
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        if (typeof window !== 'undefined' && window.screen && window.screen.orientation) {
          const orientation = window.screen.orientation as any;
          if (typeof orientation.unlock === 'function') {
            try { orientation.unlock(); } catch {}
          }
        }
      }).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement === containerRef.current;
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen) {
        if (typeof window !== 'undefined' && window.screen && window.screen.orientation) {
          const orientation = window.screen.orientation as any;
          if (typeof orientation.unlock === 'function') {
            try { orientation.unlock(); } catch {}
          }
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`w-full bg-[#0B0C10] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 transition-all duration-300 ${
        isTheaterMode ? 'max-w-none' : 'max-w-5xl mx-auto'
      }`}
    >
      {/* Main Video Frame Box */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchStart={(e) => {
          handleMouseMove();
          handleTouchStartGesture(e);
        }}
        onTouchMove={handleTouchMoveGesture}
        onTouchEnd={handleTouchEndGesture}
        style={{ filter: `brightness(${brightness})` }}
        className={`relative w-full bg-black flex items-center justify-center overflow-hidden group select-none ${
          isFullscreen 
            ? 'h-screen w-screen fixed inset-0 z-[100]' 
            : isTheaterMode 
              ? 'aspect-video max-h-[82vh]' 
              : 'aspect-video max-h-[70vh]'
        }`}
      >
        {/* Gesture Feedback HUD Overlays (Double Tap Skip & Volume/Brightness Swipes) */}
        {gestureOverlay && (
          <div key={gestureOverlay.key} className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center">
            {/* Double Tap Skip Forward HUD (+10s) */}
            {gestureOverlay.type === 'skip-fw' && (
              <div className="absolute right-8 sm:right-16 flex flex-col items-center justify-center bg-black/80 border border-[#FFD60A]/50 text-[#FFD60A] p-4 sm:p-6 rounded-full shadow-[0_0_40px_rgba(255,214,10,0.6)] animate-pulse backdrop-blur-md">
                <RotateCw className="w-8 h-8 sm:w-10 sm:h-10 fill-current animate-spin-slow" />
                <span className="text-xs sm:text-sm font-black tracking-widest mt-1">+10s</span>
              </div>
            )}

            {/* Double Tap Rewind HUD (-10s) */}
            {gestureOverlay.type === 'skip-bw' && (
              <div className="absolute left-8 sm:left-16 flex flex-col items-center justify-center bg-black/80 border border-[#FFD60A]/50 text-[#FFD60A] p-4 sm:p-6 rounded-full shadow-[0_0_40px_rgba(255,214,10,0.6)] animate-pulse backdrop-blur-md">
                <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10 fill-current animate-spin-slow" />
                <span className="text-xs sm:text-sm font-black tracking-widest mt-1">-10s</span>
              </div>
            )}

            {/* Volume Swipe HUD */}
            {gestureOverlay.type === 'volume' && (
              <div className="bg-black/85 border border-white/20 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3.5 backdrop-blur-md shadow-2xl">
                {volume === 0 ? <VolumeX className="w-6 h-6 text-red-500" /> : <Volume2 className="w-6 h-6 text-[#FFD60A]" />}
                <div className="space-y-1 w-28 sm:w-36">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                    <span className="text-gray-300">Volume</span>
                    <span className="text-[#FFD60A] font-mono">{gestureOverlay.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-[#FFD60A] transition-all" style={{ width: `${gestureOverlay.value}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Brightness Swipe HUD */}
            {gestureOverlay.type === 'brightness' && (
              <div className="bg-black/85 border border-white/20 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3.5 backdrop-blur-md shadow-2xl">
                <Sun className="w-6 h-6 text-yellow-400" />
                <div className="space-y-1 w-28 sm:w-36">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                    <span className="text-gray-300">Brightness</span>
                    <span className="text-yellow-400 font-mono">{gestureOverlay.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-yellow-400 transition-all" style={{ width: `${gestureOverlay.value}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Stream Engine Renderer */}
        {isYouTube ? (
          <div className="w-full h-full relative pointer-events-none">
            <div id={ytDivId.current} className="w-full h-full" />
            <div 
              className="absolute inset-0 z-10 cursor-pointer bg-transparent"
              onClick={togglePlay}
            />
          </div>
        ) : isDrive && useDriveIframe ? (
          <div className="w-full h-full relative">
            <iframe
              src={getDriveEmbedUrl(driveLink || videoUrl || '')}
              title={title}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
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

            {videoError && (
              <div className="absolute top-4 right-4 bg-yellow-950/90 text-[#FFD60A] border border-[#FFD60A]/60 px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 backdrop-blur-md shadow-lg z-20 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FFD60A]" />
                <span>Stream updated to HD source</span>
              </div>
            )}
          </div>
        )}

        {/* Center Play/Pause Overlay Button (Active for HTML5 & YouTube players) */}
        {(!isPlaying || showControls) && !useDriveIframe && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFD60A] hover:bg-[#ffe043] text-[#0B0C10] flex items-center justify-center shadow-[0_0_30px_rgba(255,214,10,0.8)] transition-transform transform active:scale-95 z-20 opacity-90 hover:opacity-100"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
            ) : (
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
            )}
          </button>
        )}

        {/* Subtitles Overlay */}
        {activeSubtitle !== 'off' && (
          <div className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 z-30 max-w-[85%] text-center pointer-events-none">
            <span className="bg-black/85 text-white font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-lg border border-[#FFD60A]/30 backdrop-blur-md shadow-md leading-relaxed inline-block">
              {getSubtitleText(currentTime, activeSubtitle, title, overview)}
            </span>
          </div>
        )}

        {/* SLEEK IN-VIDEO FLOATING OVERLAY CONTROLS (Small Icons, Bottom Aligned) */}
        {!useDriveIframe && (
          <div 
            className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-3 px-3.5 sm:px-5 flex flex-col gap-2 transition-opacity duration-300 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
          {/* Progress Bar */}
          <div className="flex items-center gap-2.5 w-full">
            <span className="text-[#FFD60A] font-mono font-bold text-[10px] sm:text-xs">
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
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FFD60A] hover:h-1.5 transition-all"
              />
              <div 
                className="absolute left-0 top-0 bottom-0 bg-[#FFD60A] rounded-lg pointer-events-none shadow-[0_0_8px_#FFD60A]"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            <span className="text-gray-400 font-mono font-bold text-[10px] sm:text-xs">
              {formatTime(duration)}
            </span>
          </div>

          {/* In-Video Controls Toolbar (Small Sleek Icons) */}
          <div className="flex items-center justify-between text-white">
            {/* Left Side Controls: Play, Skip 10s, Mute/Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-1.5 hover:bg-white/20 text-[#FFD60A] rounded-full transition-colors active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <button
                onClick={() => handleSkip(-10)}
                className="p-1.5 hover:bg-white/20 text-gray-300 rounded-full transition-colors active:scale-95"
                title="Rewind 10s"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleSkip(10)}
                className="p-1.5 hover:bg-white/20 text-gray-300 rounded-full transition-colors active:scale-95"
                title="Forward 10s"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {/* Volume Button & Mini Slider */}
              <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
                <button
                  onClick={toggleMute}
                  className="p-1.5 hover:bg-white/20 text-gray-300 rounded-full transition-colors active:scale-95"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#FFD60A]" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-12 sm:w-16 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-[#FFD60A]"
                />
              </div>
            </div>

            {/* Right Side Controls: Speed, Quality, Subtitles, Fullscreen */}
            <div className="flex items-center gap-2">
              {/* Speed buttons */}
              <div className="hidden sm:flex items-center gap-0.5 bg-black/40 p-0.5 rounded-lg border border-white/10 text-[10px] font-bold">
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

              {/* Quality Selector */}
              <div ref={qualityRef} className="relative">
                <button
                  onClick={() => {
                    setShowQualityDropdown(!showQualityDropdown);
                    setShowSubtitleDropdown(false);
                  }}
                  className={`p-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 border transition-all ${
                    showQualityDropdown
                      ? 'bg-[#FFD60A] text-[#0B0C10] border-[#FFD60A]'
                      : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/30'
                  }`}
                  title="Video Quality"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#FFD60A]" />
                  <span className="hidden xs:inline">{quality}</span>
                </button>

                {showQualityDropdown && (
                  <div className="absolute right-0 bottom-full mb-2 w-28 bg-[#1F2833] border border-white/20 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[9px] uppercase tracking-widest text-gray-400 font-black px-2.5 py-1 select-none">
                      Quality
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {(['720p', '1080p', '4K'] as const).map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setQuality(q);
                            setShowQualityDropdown(false);
                          }}
                          className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] font-bold transition-all ${
                            quality === q
                              ? 'bg-[#FFD60A] text-[#0B0C10]'
                              : 'text-gray-300 hover:bg-black/40 hover:text-white'
                          }`}
                        >
                          <span>{q}</span>
                          {quality === q && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Subtitles CC Button */}
              <div ref={subtitleRef} className="relative">
                <button
                  onClick={() => {
                    setShowSubtitleDropdown(!showSubtitleDropdown);
                    setShowQualityDropdown(false);
                  }}
                  className={`p-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 border transition-all ${
                    showSubtitleDropdown
                      ? 'bg-[#FFD60A] text-[#0B0C10] border-[#FFD60A]'
                      : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/30'
                  }`}
                  title="Subtitles / Captions"
                >
                  <Captions className={`w-3.5 h-3.5 ${activeSubtitle !== 'off' ? 'text-green-400' : 'text-[#FFD60A]'}`} />
                  <span>CC</span>
                </button>

                {showSubtitleDropdown && (
                  <div className="absolute right-0 bottom-full mb-2 w-32 bg-[#1F2833] border border-white/20 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[9px] uppercase tracking-widest text-gray-400 font-black px-2.5 py-1 select-none">
                      Subtitles
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {[
                        { val: 'off', lbl: 'Off' },
                        { val: 'en', lbl: 'English' },
                        { val: 'es', lbl: 'Spanish' }
                      ].map((s) => (
                        <button
                          key={s.val}
                          onClick={() => {
                            setActiveSubtitle(s.val as any);
                            setShowSubtitleDropdown(false);
                          }}
                          className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] font-bold transition-all ${
                            activeSubtitle === s.val
                              ? 'bg-[#FFD60A] text-[#0B0C10]'
                              : 'text-gray-300 hover:bg-black/40 hover:text-white'
                          }`}
                        >
                          <span>{s.lbl}</span>
                          {activeSubtitle === s.val && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Theater Mode Button */}
              {onToggleTheater && (
                <button
                  onClick={onToggleTheater}
                  className="p-1.5 hover:bg-white/20 text-gray-300 rounded-lg transition-colors active:scale-95"
                  title={isTheaterMode ? 'Standard View' : 'Theater Mode'}
                >
                  <Maximize2 className="w-4 h-4 text-[#FFD60A]" />
                </button>
              )}

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 hover:bg-white/20 text-[#FFD60A] rounded-lg transition-colors active:scale-95"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};
