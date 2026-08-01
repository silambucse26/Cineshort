'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Film, Users, CheckCircle2, UserPlus, UserCheck, Video } from 'lucide-react';
import { useShortFilm } from '../../../context/ShortFilmContext';
import { FilmCard } from '../../../components/FilmCard';

export default function DirectorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const directorId = resolvedParams.id;

  const {
    getDirectorById,
    getFilmsByDirector,
    followedDirectorIds,
    toggleFollowDirector,
  } = useShortFilm();

  const director = getDirectorById(directorId);

  if (!director) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-center p-6">
        <div className="card-flat p-8 max-w-md space-y-4">
          <h2 className="text-xl font-bold text-[#F5F5F5]">Director Profile Not Found</h2>
          <p className="text-xs text-gray-400">The director you are looking for does not exist.</p>
          <Link href="/" className="btn-gold text-xs px-4 py-2 inline-block">
            Back to Home Feed
          </Link>
        </div>
      </div>
    );
  }

  const directorFilms = getFilmsByDirector(director.id);
  const isFollowing = followedDirectorIds.includes(director.id);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header Card */}
        <div className="card-flat p-6 sm:p-8 space-y-6 relative overflow-hidden border border-gray-700/50">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Profile Avatar */}
            <div className="relative">
              <img
                src={director.profile_pic_url}
                alt={director.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#F4A300] shadow-xl"
              />
              <span className="absolute bottom-1 right-1 bg-[#F4A300] text-[#0B0C10] p-1.5 rounded-full shadow-lg">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </span>
            </div>

            {/* Profile Info */}
            <div className="flex-grow space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] flex items-center justify-center sm:justify-start gap-2">
                    {director.name}
                  </h1>
                  <p className="text-xs text-[#F4A300] font-bold uppercase tracking-wider mt-1">
                    Verified Director & Storyteller
                  </p>
                </div>

                {/* Follow Button */}
                <button
                  onClick={() => toggleFollowDirector(director.id)}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isFollowing
                      ? 'bg-[#1F2833] text-gray-300 border border-gray-600 hover:bg-[#0B0C10]'
                      : 'btn-gold'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 text-[#F4A300]" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow Director</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bio */}
              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                {director.bio}
              </p>

              {/* Stats Bar */}
              <div className="pt-3 border-t border-gray-700/40 grid grid-cols-3 gap-4 max-w-lg text-center sm:text-left">
                <div className="bg-[#0B0C10] p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                    <Film className="w-3.5 h-3.5 text-[#FFD60A]" /> Total Films
                  </div>
                  <div className="text-lg font-black text-[#F5F5F5] mt-0.5">{director.film_count}</div>
                </div>

                <div className="bg-[#0B0C10] p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                    <Star className="w-3.5 h-3.5 text-[#F4A300]" /> Avg Rating
                  </div>
                  <div className="text-lg font-black text-[#F4A300] mt-0.5">{director.avg_rating.toFixed(1)} ★</div>
                </div>

                <div className="bg-[#0B0C10] p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                    <Users className="w-3.5 h-3.5 text-[#E63946]" /> Followers
                  </div>
                  <div className="text-lg font-black text-[#F5F5F5] mt-0.5">{(director.follower_count ?? 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Films Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#F5F5F5] flex items-center gap-2">
              <Video className="w-5 h-5 text-[#FFD60A]" />
              Uploaded Short Films ({directorFilms.length})
            </h2>
          </div>

          {directorFilms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {directorFilms.map((film) => (
                <FilmCard key={film.id} film={film} />
              ))}
            </div>
          ) : (
            <div className="card-flat p-8 text-center text-gray-400 text-xs">
              No films uploaded by this director yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
