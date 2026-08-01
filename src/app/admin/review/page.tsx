'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Clock, 
  User, 
  ShieldCheck, 
  Sparkles,
  Award
} from 'lucide-react';
import { useShortFilm } from '@/context/ShortFilmContext';
import { formatDuration } from '@/services/driveService';
import { isSampleOrInvalidDriveUrl, getDriveEmbedUrl } from '@/utils/googleDriveUtils';

export default function AdminReviewQueuePage() {
  const { pendingFilms, approveFilm, rejectFilm } = useShortFilm();
  const [selectedFilmId, setSelectedFilmId] = useState<string | null>(
    pendingFilms.length > 0 ? pendingFilms[0].id : null
  );

  const activeFilm = pendingFilms.find((f) => f.id === selectedFilmId) || pendingFilms[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card-flat p-6 border border-[#E63946]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#E63946]/15 text-[#E63946] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <FileCheck2 className="w-3.5 h-3.5" /> Approval Queue
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] mt-1">Review Queue</h1>
          <p className="text-xs text-gray-300">
            Moderate uploaded short films before they are published to the public home feed.
          </p>
        </div>

        <div className="bg-[#0B0C10] px-4 py-2 rounded-xl border border-gray-800 text-xs text-[#F5F5F5]">
          <span className="text-gray-400">Pending Review: </span>
          <strong className="text-[#FFD60A] text-sm">{pendingFilms.length} films</strong>
        </div>
      </div>

      {pendingFilms.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Film List */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Pending Submissions ({pendingFilms.length})
            </h3>

            {pendingFilms.map((film) => (
              <button
                key={film.id}
                onClick={() => setSelectedFilmId(film.id)}
                className={`w-full card-flat p-3.5 flex items-center gap-3 text-left transition-all ${
                  activeFilm?.id === film.id
                    ? 'border-[#FFD60A] bg-[#0B0C10]'
                    : 'hover:border-gray-600'
                }`}
              >
                <img
                  src={film.thumbnail_url}
                  alt={film.title}
                  className="w-16 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-grow">
                  <h4 className="font-bold text-xs text-[#F5F5F5] truncate">{film.title}</h4>
                  <p className="text-[11px] text-gray-400 truncate">By {film.director_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="tag-red text-[9px] py-0.5">{film.mood_tag}</span>
                    <span className="text-[10px] text-gray-400">{formatDuration(film.duration_sec)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right Column: Embedded Preview Player & Moderation Controls */}
          {activeFilm && (
            <div className="lg:col-span-7 space-y-6">
              <div className="card-flat p-6 space-y-6 border border-[#F4A300]/30 shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
                  <span className="text-xs font-bold text-[#FFD60A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Previewing: {activeFilm.title}
                  </span>
                  <span className="badge-amber text-[10px]">Status: Pending</span>
                </div>

                {/* Embedded Video Player */}
                <div className="aspect-video bg-[#0B0C10] rounded-xl overflow-hidden border border-gray-800">
                  {isSampleOrInvalidDriveUrl(activeFilm.drive_link) ? (
                    <video
                      src={activeFilm.video_fallback_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'}
                      controls
                      poster={activeFilm.thumbnail_url}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={getDriveEmbedUrl(activeFilm.drive_link)}
                      title={activeFilm.title}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  )}
                </div>

                {/* Film Metadata */}
                <div className="space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-gray-300">
                    <span className="flex items-center gap-1 font-bold text-[#F4A300]">
                      <User className="w-3.5 h-3.5" /> Director: {activeFilm.director_name}
                    </span>
                    <span>Cast: {activeFilm.hero_names.join(', ')}</span>
                  </div>

                  <p className="text-gray-300 bg-[#0B0C10] p-3 rounded-lg border border-gray-800 leading-relaxed">
                    {activeFilm.overview}
                  </p>
                </div>

                {/* Approve / Reject Actions */}
                <div className="pt-4 border-t border-gray-700/50 flex items-center gap-4">
                  <button
                    onClick={() => {
                      approveFilm(activeFilm.id);
                      setSelectedFilmId(null);
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Publish to Feed</span>
                  </button>

                  <button
                    onClick={() => {
                      rejectFilm(activeFilm.id);
                      setSelectedFilmId(null);
                    }}
                    className="flex-1 bg-[#E63946] hover:bg-[#E63946]/90 text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Submission</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card-flat p-12 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-[#F5F5F5]">Review Queue Empty</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            All submitted short films have been reviewed! New submissions from directors will appear here.
          </p>
          <Link href="/admin/upload" className="btn-gold text-xs px-4 py-2 inline-block">
            Upload Movie as Admin
          </Link>
        </div>
      )}
    </div>
  );
}
