'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { 
  Star, 
  Film, 
  Users, 
  CheckCircle2, 
  UserPlus, 
  UserCheck, 
  Video, 
  Edit3, 
  X, 
  Save, 
  ImageIcon, 
  Sparkles 
} from 'lucide-react';
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
    activePersona,
    updateDirector,
  } = useShortFilm();

  const director = getDirectorById(directorId);

  // Admin Editing Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPicUrl, setEditPicUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
  const isAdmin = activePersona?.role === 'admin';

  const handleOpenEdit = () => {
    setEditName(director.name);
    setEditBio(director.bio);
    setEditPicUrl(director.profile_pic_url);
    setErrorMsg(null);
    setIsEditing(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        setErrorMsg('Image size exceeds 1.5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPicUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    updateDirector(director.id, {
      name: editName.trim(),
      bio: editBio.trim() || 'Emerging short filmmaker.',
      profile_pic_url: editPicUrl || director.profile_pic_url,
    });

    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header Card */}
        <div className="card-flat p-6 sm:p-8 space-y-6 relative overflow-hidden border border-gray-700/50">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Profile Avatar */}
            <div className="relative group">
              <img
                src={director.profile_pic_url}
                alt={director.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#F4A300] shadow-xl bg-[#0B0C10]"
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

                {/* Actions: Admin Edit & User Follow */}
                <div className="flex items-center gap-2 justify-center sm:justify-end">
                  {isAdmin && (
                    <button
                      onClick={handleOpenEdit}
                      className="px-4 py-2.5 bg-[#FFD60A] text-[#0B0C10] hover:bg-[#ffe043] rounded-lg text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                      title="Admin Edit Director Profile"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}

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

      {/* ADMIN EDIT DIRECTOR MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-[#0B0C10]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-flat p-6 max-w-lg w-full border border-[#FFD60A]/50 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFD60A]" />
                <h3 className="font-extrabold text-base text-[#F5F5F5]">Admin: Edit Director Profile</h3>
              </div>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-400 font-bold text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Director Name */}
              <div>
                <label className="block font-bold text-gray-300 mb-1.5 uppercase text-[10px]">
                  Director Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter director name"
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-3 text-[#F5F5F5] font-semibold focus:border-[#FFD60A] outline-none"
                />
              </div>

              {/* Profile Photo Upload / URL */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-300 uppercase text-[10px]">
                  Profile Photo (Upload or Image URL)
                </label>
                
                <div className="flex items-center gap-3">
                  <img
                    src={editPicUrl || director.profile_pic_url}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#FFD60A] bg-black shrink-0"
                  />
                  <div className="flex-grow space-y-2">
                    <input
                      type="text"
                      value={editPicUrl}
                      onChange={(e) => setEditPicUrl(e.target.value)}
                      placeholder="Paste image URL..."
                      className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-2.5 text-[#F5F5F5] font-semibold focus:border-[#FFD60A] outline-none"
                    />
                    
                    <div className="relative">
                      <input
                        type="file"
                        id="director-photo-file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="director-photo-file"
                        className="w-full text-center bg-[#1F2833] hover:bg-[#1F2833]/80 border border-gray-700 text-gray-300 font-bold py-2 rounded-lg cursor-pointer transition-colors block select-none"
                      >
                        Upload Local Photo File...
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div>
                <label className="block font-bold text-gray-300 mb-1.5 uppercase text-[10px]">
                  Director Biography
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={4}
                  placeholder="Enter director biography..."
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-3 text-[#F5F5F5] font-semibold focus:border-[#FFD60A] outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-700/50">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold px-5 py-2 rounded-lg font-extrabold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-[#0B0C10]" />
                  <span>Save Director Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
