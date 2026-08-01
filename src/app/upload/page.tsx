'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileVideo, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Clock, 
  Tag, 
  User, 
  FolderCheck,
  ShieldCheck,
  Link as LinkIcon,
  Image as ImageIcon,
  Users
} from 'lucide-react';
import { Youtube } from '@/components/YoutubeIcon';
import { useShortFilm } from '../../context/ShortFilmContext';
import { MoodTag } from '../../types/shortfilm';
import { uploadVideoToGoogleDrive, detectVideoDuration, formatDuration } from '../../services/driveService';
import { extractYouTubeId, getYouTubeThumbnail, isYouTubeUrl } from '../../utils/youtubeUtils';

export default function UploadFlowPage() {
  const router = useRouter();
  const { addFilm, activePersona, isLoaded, directors, heroes, addDirector, addHero } = useShortFilm();

  // Guard for admin only
  useEffect(() => {
    if (isLoaded) {
      if (!activePersona || activePersona.role !== 'admin') {
        router.replace('/login?redirect=/upload');
      }
    }
  }, [isLoaded, activePersona, router]);

  // Mode: 'youtube' | 'file'
  const [uploadMode, setUploadMode] = useState<'youtube' | 'file'>('youtube');

  // Upload Steps: 1 = Select Source, 2 = Processing/Upload, 3 = Metadata Form, 4 = Confirm & Publish
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // YouTube State
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  // File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [driveDetails, setDriveDetails] = useState<{
    fileId: string;
    previewLink: string;
    folderName: string;
    fileSizeFormatted: string;
  } | null>(null);

  // Form Metadata Details
  const [title, setTitle] = useState('');
  const [moodTag, setMoodTag] = useState<MoodTag>('thriller');
  const [durationSec, setDurationSec] = useState<number>(180);
  const [overview, setOverview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Director Assigning state
  const [directorSelectionMode, setDirectorSelectionMode] = useState<'existing' | 'new'>('existing');
  const [selectedDirectorId, setSelectedDirectorId] = useState('');
  const [newDirectorName, setNewDirectorName] = useState('');
  const [newDirectorBio, setNewDirectorBio] = useState('');
  const [newDirectorPic, setNewDirectorPic] = useState('');

  // Dynamic Hero Assigning state
  const [heroSelectionMode, setHeroSelectionMode] = useState<'existing' | 'new'>('existing');
  const [selectedHeroIds, setSelectedHeroIds] = useState<string[]>([]);
  const [newHeroName, setNewHeroName] = useState('');
  const [newHeroBio, setNewHeroBio] = useState('');
  const [newHeroPic, setNewHeroPic] = useState('');

  // Set default selected director once loaded
  useEffect(() => {
    if (directors && directors.length > 0 && !selectedDirectorId) {
      setSelectedDirectorId(directors[0].id);
    }
  }, [directors]);

  // Handle YouTube URL Submit
  const handleYouTubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setYoutubeError(null);

    const extracted = extractYouTubeId(youtubeUrlInput);
    if (!extracted) {
      setYoutubeError('Invalid YouTube URL. Please enter a valid YouTube video link (e.g., https://www.youtube.com/watch?v=...)');
      return;
    }

    setYoutubeId(extracted);
    if (!title) {
      setTitle('Short Film #' + extracted.substring(0, 5));
    }
    setCurrentStep(3);
  };

  // Handle File Selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));

      const detectedSec = await detectVideoDuration(file);
      setDurationSec(detectedSec);
      startDriveUpload(file);
    }
  };

  // Drive Auto Upload
  const startDriveUpload = async (file: File) => {
    setCurrentStep(2);
    setUploadProgress(10);

    const result = await uploadVideoToGoogleDrive(
      file,
      activePersona.id,
      newDirectorName || 'Young Director',
      (progress) => setUploadProgress(progress)
    );

    setDriveDetails(result);
    setTimeout(() => {
      setCurrentStep(3);
    }, 600);
  };

  // Step 4: Confirm and Publish
  const handlePublish = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);

    try {
      let finalDirectorId = '';
      let finalDirectorName = '';
      let finalDirectorPic = '';

      // 1. Resolve or Create Director
      if (directorSelectionMode === 'existing') {
        const found = directors.find((d) => d.id === selectedDirectorId);
        if (found) {
          finalDirectorId = found.id;
          finalDirectorName = found.name;
          finalDirectorPic = found.profile_pic_url;
        } else {
          // Fallback if none found
          const fallback = directors[0];
          if (fallback) {
            finalDirectorId = fallback.id;
            finalDirectorName = fallback.name;
            finalDirectorPic = fallback.profile_pic_url;
          } else {
            // Create default
            const created = addDirector({
              name: 'Independent Director',
              bio: 'Emerging filmmaker.',
              profile_pic_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'
            });
            finalDirectorId = created.id;
            finalDirectorName = created.name;
            finalDirectorPic = created.profile_pic_url;
          }
        }
      } else {
        // Create new director
        const created = addDirector({
          name: newDirectorName.trim() || 'New Director',
          bio: newDirectorBio.trim() || 'Emerging short filmmaker.',
          profile_pic_url: newDirectorPic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'
        });
        finalDirectorId = created.id;
        finalDirectorName = created.name;
        finalDirectorPic = created.profile_pic_url;
      }

      // 2. Resolve or Create Heroes
      let finalHeroIds: string[] = [];
      let finalHeroNames: string[] = [];

      if (heroSelectionMode === 'existing') {
        finalHeroIds = [...selectedHeroIds];
        finalHeroNames = selectedHeroIds
          .map(id => heroes.find(h => h.id === id)?.name)
          .filter(Boolean) as string[];
      } else {
        // Create new hero
        const created = addHero({
          name: newHeroName.trim() || 'New Cast Member',
          bio: newHeroBio.trim() || 'Independent performer.',
          profile_pic_url: newHeroPic || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80'
        });
        finalHeroIds = [created.id];
        finalHeroNames = [created.name];
      }

      // 3. Finalize Video details
      const isYt = uploadMode === 'youtube' && youtubeId;
      const thumb = isYt 
        ? getYouTubeThumbnail(youtubeId!) 
        : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80';

      const newFilm = addFilm({
        title: title.trim(),
        director_id: finalDirectorId,
        director_name: finalDirectorName,
        director_pic: finalDirectorPic,
        hero_ids: finalHeroIds,
        hero_names: finalHeroNames.length > 0 ? finalHeroNames : ['Independent Cast'],
        duration_sec: durationSec,
        mood_tag: moodTag,
        drive_file_id: driveDetails?.fileId || (isYt ? `yt-${youtubeId}` : 'sample-id'),
        drive_link: driveDetails?.previewLink || (isYt ? `https://www.youtube.com/watch?v=${youtubeId}` : ''),
        youtube_url: isYt ? `https://www.youtube.com/watch?v=${youtubeId}` : undefined,
        youtube_id: isYt ? youtubeId! : undefined,
        video_source: isYt ? 'youtube' : 'drive',
        video_fallback_url: isYt 
          ? `https://www.youtube.com/watch?v=${youtubeId}` 
          : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnail_url: thumb,
        overview: overview.trim() || 'A captivating short film uploaded by an independent filmmaker.',
        status: 'approved',
      });

      setIsSubmitting(false);
      router.push(`/film/${newFilm.id}`);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
        <div className="text-xs text-gray-400 font-bold animate-pulse">Loading auth session...</div>
      </div>
    );
  }

  if (!activePersona || activePersona.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-center p-4">
        <div className="card-flat p-6 border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-wider">
          Access Denied. Administrator privilege required to upload films.
        </div>
      </div>
    );
  }

  // Get current assigned labels
  const getAssignedDirectorLabel = () => {
    if (directorSelectionMode === 'existing') {
      return directors.find(d => d.id === selectedDirectorId)?.name || 'None selected';
    }
    return newDirectorName || 'New Director';
  };

  const getAssignedCastLabel = () => {
    if (heroSelectionMode === 'existing') {
      return selectedHeroIds
        .map(id => heroes.find(h => h.id === id)?.name)
        .filter(Boolean)
        .join(', ') || 'Independent Cast';
    }
    return newHeroName || 'New Cast Member';
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Step Indicator Header */}
        <div className="card-flat p-6 border border-[#FFD60A]/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#FFD60A] font-black uppercase tracking-widest">
              <Upload className="w-4 h-4" />
              <span>Admin Studio Upload</span>
            </div>
            <span className="text-[10px] text-gray-400 font-bold">Step {currentStep} of 4</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-colors ${
                  currentStep >= step ? 'bg-[#FFD60A]' : 'bg-[#1F2833]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Select Upload Source */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Mode Switcher Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setUploadMode('youtube')}
                className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center gap-3 ${
                  uploadMode === 'youtube'
                    ? 'bg-[#1F2833] border-[#FFD60A] text-[#FFD60A] shadow-lg scale-[1.02]'
                    : 'bg-[#1F2833]/30 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Youtube className="w-8 h-8" />
                <span className="text-sm font-black uppercase tracking-wider">YouTube Stream Link</span>
                <span className="text-[10px] opacity-75">Stream via video identifier URL</span>
              </button>

              <button
                onClick={() => setUploadMode('file')}
                className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center gap-3 ${
                  uploadMode === 'file'
                    ? 'bg-[#1F2833] border-[#FFD60A] text-[#FFD60A] shadow-lg scale-[1.02]'
                    : 'bg-[#1F2833]/30 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <FileVideo className="w-8 h-8" />
                <span className="text-sm font-black uppercase tracking-wider">Local Video File</span>
                <span className="text-[10px] opacity-75">Upload straight to Google Drive</span>
              </button>
            </div>

            {/* Source Inputs */}
            {uploadMode === 'youtube' ? (
              <form onSubmit={handleYouTubeSubmit} className="card-flat p-6 sm:p-8 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-[#F5F5F5]">Enter YouTube Video URL</h3>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    Provide any public or unlisted YouTube video URL. Streamix will extract the video metadata and prepare the theater stream player.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center bg-[#0B0C10] border border-gray-800 focus-within:border-[#FFD60A] rounded-xl px-4 py-3 text-xs shadow-inner">
                    <LinkIcon className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
                    <input
                      type="url"
                      required
                      value={youtubeUrlInput}
                      onChange={(e) => setYoutubeUrlInput(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      className="bg-transparent text-[#F5F5F5] w-full focus:outline-none font-semibold"
                    />
                  </div>
                  {youtubeError && (
                    <div className="text-[11px] text-[#E63946] font-bold">{youtubeError}</div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="btn-gold text-xs px-6 py-3 font-extrabold flex items-center gap-1.5 shadow-lg"
                  >
                    <span>Fetch Media Details</span>
                    <ArrowRight className="w-4 h-4 text-[#0B0C10]" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="card-flat p-8 text-center border-2 border-dashed border-gray-800 hover:border-gray-700 transition-colors rounded-2xl flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-[#1F2833]/50 rounded-full text-[#FFD60A]">
                  <Upload className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-[#F5F5F5]">Select Movie File</h3>
                  <p className="text-[10px] text-gray-450">MP4, MOV, or WEBM up to 50MB</p>
                </div>

                <label className="btn-gold cursor-pointer inline-flex items-center gap-2 text-xs font-bold px-6 py-3 shadow-lg">
                  <FileVideo className="w-4 h-4" />
                  <span>Choose Video File</span>
                  <input type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Auto-Upload to Google Drive */}
        {currentStep === 2 && (
          <div className="card-flat p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#1F2833] border-2 border-[#FFD60A] text-[#FFD60A] flex items-center justify-center mx-auto animate-pulse">
              <FolderCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#F5F5F5]">Uploading to Google Drive...</h2>
              <p className="text-xs text-gray-400">
                Directly allocating file into Director Folder: <strong className="text-[#FFD60A]">{getAssignedDirectorLabel()}</strong>
              </p>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <div className="w-full bg-[#0B0C10] h-3 rounded-full overflow-hidden border border-gray-700">
                <div
                  className="bg-[#FFD60A] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#FFD60A]">{uploadProgress}% Complete</span>
            </div>
          </div>
        )}

        {/* Step 3: Metadata Form */}
        {currentStep === 3 && (
          <div className="card-flat p-6 sm:p-8 space-y-6">
            {/* Preview Badge */}
            <div className="bg-[#0B0C10] p-4 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {uploadMode === 'youtube' && youtubeId ? (
                  <img
                    src={getYouTubeThumbnail(youtubeId)}
                    alt="YouTube Preview"
                    className="w-14 h-10 object-cover rounded-lg border border-[#FFD60A]"
                  />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-[#FFD60A]" />
                )}
                <div>
                  <span className="font-bold text-[#FFD60A] block">
                    {uploadMode === 'youtube' ? 'YouTube Stream Ready' : 'Drive Video Uploaded'}
                  </span>
                  <span className="text-gray-400">
                    {uploadMode === 'youtube' ? `YouTube ID: ${youtubeId}` : `Drive ID: ${driveDetails?.fileId}`}
                  </span>
                </div>
              </div>
              <span className="badge-amber text-[10px] uppercase font-bold">
                {uploadMode === 'youtube' ? 'YouTube Stream' : 'Drive Stream'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-[#F5F5F5]">Add Short Film Details</h2>

            <div className="space-y-5 text-xs">
              {/* Title */}
              <div>
                <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Film Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Midnight Frequency"
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-3 text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              {/* Mood Tag & Duration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Mood Tag *
                  </label>
                  <select
                    value={moodTag}
                    onChange={(e) => setMoodTag(e.target.value as MoodTag)}
                    className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-3 text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
                  >
                    <option value="thriller">⚡ Thriller</option>
                    <option value="uplifting">🌅 Uplifting</option>
                    <option value="dark">🌙 Dark</option>
                    <option value="romantic">❤️ Romantic</option>
                    <option value="comedy">🎭 Comedy</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Duration (Seconds) ({formatDuration(durationSec)})
                  </label>
                  <input
                    type="number"
                    value={durationSec}
                    onChange={(e) => setDurationSec(Number(e.target.value))}
                    min={10}
                    max={1200}
                    className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-3 text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>
              </div>

              {/* DIRECTOR ASSIGNMENT BOX */}
              <div className="bg-[#1F2833]/45 p-4 rounded-xl border border-gray-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-2 gap-2">
                  <span className="font-black text-gray-200 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#FFD60A]" /> Director Assignment
                  </span>
                  <div className="flex gap-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setDirectorSelectionMode('existing')}
                      className={`px-3 py-1 rounded-lg font-bold text-[9px] uppercase border transition-colors ${
                        directorSelectionMode === 'existing' 
                          ? 'bg-[#FFD60A] text-[#0B0C10] border-[#FFD60A]' 
                          : 'border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      Choose Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirectorSelectionMode('new')}
                      className={`px-3 py-1 rounded-lg font-bold text-[9px] uppercase border transition-colors ${
                        directorSelectionMode === 'new' 
                          ? 'bg-[#FFD60A] text-[#0B0C10] border-[#FFD60A]' 
                          : 'border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      Register New
                    </button>
                  </div>
                </div>

                {directorSelectionMode === 'existing' ? (
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Select Director Profile
                    </label>
                    {directors.length > 0 ? (
                      <select
                        value={selectedDirectorId}
                        onChange={(e) => setSelectedDirectorId(e.target.value)}
                        className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg p-3 text-[#F5F5F5] focus:outline-none"
                      >
                        {directors.map((dir) => (
                          <option key={dir.id} value={dir.id}>
                            {dir.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-[11px] text-[#F4A300] italic">
                        No directors registered yet. Please select "Register New" to add one first.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">
                        New Director Full Name
                      </label>
                      <input
                        type="text"
                        value={newDirectorName}
                        onChange={(e) => setNewDirectorName(e.target.value)}
                        placeholder="e.g. Silambarasan"
                        className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg p-3 text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">
                        New Director Biography
                      </label>
                      <textarea
                        value={newDirectorBio}
                        onChange={(e) => setNewDirectorBio(e.target.value)}
                        placeholder="Biography detail..."
                        rows={2}
                        className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg p-3 text-[#F5F5F5] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Director Profile Pic Image
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="new-dir-pic-u"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setNewDirectorPic(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="new-dir-pic-u"
                          className="flex-grow text-center bg-[#0B0C10] hover:bg-[#0B0C10]/80 border border-gray-800 text-gray-300 font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                        >
                          {newDirectorPic ? '✓ Picture Attached' : 'Upload Avatar File...'}
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CAST ASSIGNMENT BOX */}
              <div className="bg-[#1F2833]/45 p-4 rounded-xl border border-gray-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-2 gap-2">
                  <span className="font-black text-gray-200 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#FFD60A]" /> Cast (Heroes) Assignment
                  </span>
                  <div className="flex gap-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setHeroSelectionMode('existing')}
                      className={`px-3 py-1 rounded-lg font-bold text-[9px] uppercase border transition-colors ${
                        heroSelectionMode === 'existing' 
                          ? 'bg-[#FFD60A] text-[#0B0C10] border-[#FFD60A]' 
                          : 'border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      Choose Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroSelectionMode('new')}
                      className={`px-3 py-1 rounded-lg font-bold text-[9px] uppercase border transition-colors ${
                        heroSelectionMode === 'new' 
                          ? 'bg-[#FFD60A] text-[#0B0C10] border-[#FFD60A]' 
                          : 'border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      Register New
                    </button>
                  </div>
                </div>

                {heroSelectionMode === 'existing' ? (
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Select Starring Heroes
                    </label>
                    {heroes.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2.5 bg-[#0B0C10] p-3 rounded-lg border border-gray-800 max-h-36 overflow-y-auto font-medium">
                        {heroes.map((hero) => {
                          const isChecked = selectedHeroIds.includes(hero.id);
                          return (
                            <label key={hero.id} className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedHeroIds(prev => 
                                    isChecked ? prev.filter(id => id !== hero.id) : [...prev, hero.id]
                                  );
                                }}
                                className="rounded border-gray-700 text-[#FFD60A] focus:ring-[#FFD60A] bg-black w-4 h-4 cursor-pointer"
                              />
                              <span className="truncate">{hero.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#F4A300] italic">
                        No heroes registered yet. Please select "Register New" to add cast.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">
                        New Hero/Cast Name
                      </label>
                      <input
                        type="text"
                        value={newHeroName}
                        onChange={(e) => setNewHeroName(e.target.value)}
                        placeholder="e.g. Kabir Das"
                        className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg p-3 text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Hero Description/Filmography
                      </label>
                      <textarea
                        value={newHeroBio}
                        onChange={(e) => setNewHeroBio(e.target.value)}
                        placeholder="Performance details..."
                        rows={2}
                        className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg p-3 text-[#F5F5F5] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Hero Profile Picture
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="new-hero-pic-u"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setNewHeroPic(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="new-hero-pic-u"
                          className="flex-grow text-center bg-[#0B0C10] hover:bg-[#0B0C10]/80 border border-gray-800 text-gray-300 font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                        >
                          {newHeroPic ? '✓ Picture Attached' : 'Upload Avatar File...'}
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Synopsis */}
              <div>
                <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Synopsis / Overview
                </label>
                <textarea
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  placeholder="Describe the premise, mood, or story of your short film..."
                  rows={3}
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-3 text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-gray-700/50">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Source
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                disabled={!title.trim()}
                className="btn-gold text-xs px-5 py-2.5 flex items-center gap-1.5 disabled:opacity-50 font-extrabold"
              >
                <span>Continue to Confirm</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm and Publish */}
        {currentStep === 4 && (
          <div className="card-flat p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-[#F5F5F5]">Confirm & Publish Short Film</h2>

            <div className="bg-[#0B0C10] p-4 rounded-xl border border-gray-800 space-y-3 text-xs font-semibold">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Film Title:</span>
                <span className="font-bold text-[#F5F5F5]">{title}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Assigned Director:</span>
                <span className="font-bold text-[#FFD60A]">{getAssignedDirectorLabel()}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Mood & Duration:</span>
                <span className="font-bold text-white uppercase">{moodTag} ({formatDuration(durationSec)})</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Cast / Heroes:</span>
                <span className="font-bold text-white">{getAssignedCastLabel()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Video Source:</span>
                <span className="font-bold text-[#FFD60A]">
                  {uploadMode === 'youtube' ? `YouTube (ID: ${youtubeId})` : 'Google Drive Embed'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(3)}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Edit Details
              </button>

              <button
                onClick={handlePublish}
                disabled={isSubmitting}
                className="btn-gold text-xs px-6 py-3 font-black flex items-center gap-2 shadow-xl"
              >
                <Sparkles className="w-4 h-4 text-[#0B0C10]" />
                <span>{isSubmitting ? 'Publishing...' : 'Publish to Feed'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
