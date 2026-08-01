'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { isSampleOrInvalidDriveUrl, getDriveEmbedUrl } from '../utils/googleDriveUtils';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  youtubeKey?: string;
  videoUrl?: string;
  movieTitle: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, onClose, youtubeKey, videoUrl, movieTitle }) => {
  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isDirectVideo = videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.startsWith('blob:'));
  const isDriveUrl = videoUrl && videoUrl.includes('drive.google.com');
  const isSampleDrive = isDriveUrl && isSampleOrInvalidDriveUrl(videoUrl);

  const renderVideoPlayer = () => {
    if (isDirectVideo) {
      return (
        <video
          src={videoUrl}
          controls
          autoPlay
          onError={(e) => {
            (e.target as HTMLVideoElement).src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
          }}
          className="w-full h-full object-contain"
        />
      );
    }

    if (isDriveUrl) {
      if (isSampleDrive) {
        if (youtubeKey) {
          return (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&modestbranding=1&rel=0`}
              title={`${movieTitle} Official Trailer`}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          );
        }
        return (
          <video
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        );
      }

      return (
        <iframe
          src={getDriveEmbedUrl(videoUrl)}
          title={`${movieTitle} Player`}
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    }

    if (youtubeKey) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&modestbranding=1&rel=0`}
          title={`${movieTitle} Official Trailer`}
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-netflix-gray">
        <p className="text-xl font-medium text-white mb-2">Video Unavailable</p>
        <p className="text-sm text-center max-w-md">We couldn't retrieve the video stream for this movie. Please try again later.</p>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-8"
          onClick={onClose}
        >
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl aspect-video bg-netflix-dark rounded-xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Control */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
              <span className="hidden md:inline-block text-sm font-semibold tracking-wide bg-black/60 px-3 py-1.5 rounded-md text-white/90 backdrop-blur-sm">
                Playing: {movieTitle}
              </span>
              <button
                onClick={onClose}
                className="p-2 bg-black/60 hover:bg-brand-red rounded-full text-white transition-colors duration-200 border border-white/10 hover:border-transparent focus:outline-none"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player Container */}
            <div className="w-full h-full">
              {renderVideoPlayer()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default TrailerModal;
