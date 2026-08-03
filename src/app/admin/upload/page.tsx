'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileVideo, 
  Plus, 
  FolderCheck, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Tag, 
  Clock, 
  ShieldCheck,
  Link as LinkIcon
} from 'lucide-react';
import { Youtube } from '@/components/YoutubeIcon';
import { useShortFilm } from '@/context/ShortFilmContext';
import { MoodTag, FilmStatus } from '@/types/shortfilm';
import { uploadToDirectorDriveFolder } from '@/lib/googleDrive';
import { detectVideoDuration, formatDuration } from '@/services/driveService';
import { extractYouTubeId, getYouTubeThumbnail } from '@/utils/youtubeUtils';

export default function AdminUploadMoviePage() {
  const router = useRouter();
  const { directors, heroes, addFilm, addDirector, addHero } = useShortFilm();

  // Upload Source Mode: 'youtube' | 'file'
  const [sourceMode, setSourceMode] = useState<'youtube' | 'file'>('youtube');

  // Form State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [selectedDirectorId, setSelectedDirectorId] = useState<string>(directors[0]?.id || '');
  const [newDirectorName, setNewDirectorName] = useState('');
  const [isAddingNewDirector, setIsAddingNewDirector] = useState(false);

  const [selectedHeroNames, setSelectedHeroNames] = useState<string>('Kabir Das');
  const [moodTag, setMoodTag] = useState<MoodTag>('thriller');
  const [durationSec, setDurationSec] = useState<number>(180);
  const [overview, setOverview] = useState('');
  const [initialStatus, setInitialStatus] = useState<FilmStatus>('approved');

  // Thumbnail State (Optional)
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState('');
  const [customThumbnailFile, setCustomThumbnailFile] = useState('');
  const [directVideoUrl, setDirectVideoUrl] = useState('');

  // Upload Progress State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
      const detected = await detectVideoDuration(file);
      setDurationSec(detected);
    }
  };

  const handleYouTubeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setYoutubeUrl(val);
    const ytId = extractYouTubeId(val);
    if (ytId && !title) {
      setTitle('YouTube Short #' + ytId.substring(0, 5));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (sourceMode === 'file' && !selectedFile) return;
    if (sourceMode === 'youtube' && !extractYouTubeId(youtubeUrl)) return;

    setIsUploading(true);
    setUploadProgress(20);

    let activeDirectorId = selectedDirectorId;
    let activeDirectorName = directors.find((d) => d.id === selectedDirectorId)?.name || 'Young Director';

    if (isAddingNewDirector && newDirectorName.trim()) {
      const createdDir = addDirector({
        name: newDirectorName.trim(),
        bio: 'New director profile created via Admin Upload.',
        profile_pic_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
      });
      activeDirectorId = createdDir.id;
      activeDirectorName = createdDir.name;
    }

    let driveFileId = '';
    let driveLink = '';
    let ytId = extractYouTubeId(youtubeUrl);

    if (sourceMode === 'file' && selectedFile) {
      setUploadProgress(50);
      const driveUpload = await uploadToDirectorDriveFolder(selectedFile, activeDirectorId, activeDirectorName);
      driveFileId = driveUpload.drive_file_id;
      driveLink = driveUpload.drive_link;
    } else if (ytId) {
      driveFileId = `yt-${ytId}`;
      driveLink = `https://www.youtube.com/watch?v=${ytId}`;
    }

    setUploadProgress(85);
    const heroList = selectedHeroNames.split(',').map((h) => h.trim()).filter(Boolean);

    const isYt = sourceMode === 'youtube' && ytId;
    const thumb = customThumbnailFile || customThumbnailUrl.trim() || (isYt 
      ? getYouTubeThumbnail(ytId!) 
      : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80');

    addFilm({
      title: title.trim(),
      director_id: activeDirectorId,
      director_name: activeDirectorName,
      hero_ids: [],
      hero_names: heroList.length > 0 ? heroList : ['Featured Cast'],
      duration_sec: durationSec,
      mood_tag: moodTag,
      drive_file_id: driveFileId,
      drive_link: driveLink,
      youtube_url: isYt ? `https://www.youtube.com/watch?v=${ytId}` : undefined,
      youtube_id: isYt ? ytId! : undefined,
      video_source: isYt ? 'youtube' : 'drive',
      video_fallback_url: isYt 
        ? `https://www.youtube.com/watch?v=${ytId}` 
        : (directVideoUrl.trim() || (selectedFile ? URL.createObjectURL(selectedFile) : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4')),
      thumbnail_url: thumb,
      overview: overview.trim() || 'Short film uploaded via Admin Management Panel.',
      status: initialStatus || 'approved',
    });

    setUploadProgress(100);
    setTimeout(() => {
      setIsUploading(false);
      if (initialStatus === 'approved') {
        router.push('/');
      } else {
        router.push('/admin/review');
      }
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="card-flat p-6 border border-[#FFD60A]/40 flex items-center justify-between shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FFD60A]/15 text-[#FFD60A] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Upload className="w-3.5 h-3.5" /> Cinema & YouTube Upload
          </div>
          <h1 className="text-2xl font-black text-[#F5F5F5] mt-1">Admin Movie Upload</h1>
        </div>
        <span className="badge-amber text-xs">YouTube & Drive Ready</span>
      </div>

      {/* Progress Overlay */}
      {isUploading && (
        <div className="card-flat p-8 text-center space-y-4">
          <FolderCheck className="w-12 h-12 text-[#FFD60A] mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-[#F5F5F5]">Processing Short Film Record...</h3>
          <div className="w-full bg-[#0B0C10] h-3 rounded-full overflow-hidden border border-gray-700 max-w-md mx-auto">
            <div className="bg-[#FFD60A] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="text-xs text-[#FFD60A] font-bold">{uploadProgress}% - Registering Film Metadata</p>
        </div>
      )}

      {!isUploading && (
        <form onSubmit={handleFormSubmit} className="card-flat p-6 sm:p-8 space-y-6 text-xs">
          {/* Source Tabs */}
          <div className="flex bg-[#0B0C10] p-1.5 rounded-xl border border-gray-800 gap-2">
            <button
              type="button"
              onClick={() => setSourceMode('youtube')}
              className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                sourceMode === 'youtube'
                  ? 'bg-[#FFD60A] text-[#0B0C10] shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>YouTube URL Link</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceMode('file')}
              className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                sourceMode === 'file'
                  ? 'bg-[#FFD60A] text-[#0B0C10] shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileVideo className="w-4 h-4 text-[#F4A300]" />
              <span>Video File / Google Drive</span>
            </button>
          </div>

          {/* YouTube Video URL Input */}
          {sourceMode === 'youtube' && (
            <div className="border-2 border-dashed border-[#FFD60A]/40 rounded-xl p-6 text-center space-y-3 bg-[#0B0C10]">
              <Youtube className="w-10 h-10 text-red-500 mx-auto" />
              <div>
                <p className="font-bold text-[#F5F5F5] text-sm">Paste YouTube Video Link</p>
                <p className="text-gray-400 text-[11px]">Supports watch URLs, shorts, and embed links</p>
              </div>
              <div className="relative max-w-md mx-auto">
                <input
                  type="url"
                  required
                  value={youtubeUrl}
                  onChange={handleYouTubeChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#1F2833] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
                />
                <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>
          )}

          {/* File Selector */}
          {sourceMode === 'file' && (
            <div className="border-2 border-dashed border-[#F4A300]/40 rounded-xl p-6 text-center space-y-3 bg-[#0B0C10]">
              <FileVideo className="w-10 h-10 text-[#FFD60A] mx-auto" />
              <div>
                <p className="font-bold text-[#F5F5F5] text-sm">
                  {selectedFile ? selectedFile.name : 'Select Video File for Google Drive Upload'}
                </p>
                <p className="text-gray-400 text-[11px]">MP4, MOV, WEBM (Max 500 MB)</p>
              </div>
              <label className="btn-gold text-xs px-4 py-2 cursor-pointer inline-flex items-center gap-1.5">
                <span>Browse Video File</span>
                <input type="file" accept="video/*" required={sourceMode === 'file'} onChange={handleFileSelect} className="hidden" />
              </label>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                Film Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neon Suburbia"
                className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-3 text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
              />
            </div>

            {/* Director Select / Add New */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-gray-300 uppercase tracking-wider">
                  Select Director *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewDirector(!isAddingNewDirector)}
                  className="text-[#FFD60A] text-[11px] font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {isAddingNewDirector ? 'Choose Existing Director' : 'Add New Director Profile'}
                </button>
              </div>

              {isAddingNewDirector ? (
                <input
                  type="text"
                  required
                  value={newDirectorName}
                  onChange={(e) => setNewDirectorName(e.target.value)}
                  placeholder="Enter new director full name..."
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-3 text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
                />
              ) : (
                <select
                  value={selectedDirectorId}
                  onChange={(e) => setSelectedDirectorId(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-3 text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
                >
                  {directors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.avg_rating} ★)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Hero / Cast Names */}
            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                Hero / Actor Names (Comma-separated)
              </label>
              <input
                type="text"
                value={selectedHeroNames}
                onChange={(e) => setSelectedHeroNames(e.target.value)}
                placeholder="e.g. Kabir Das, Tara Malhotra"
                className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-3 text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
              />
            </div>

            {/* THUMBNAIL IMAGE (OPTIONAL) */}
            <div className="bg-[#0B0C10] p-4 rounded-xl border border-gray-800 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="font-black text-gray-200 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  Thumbnail Image <span className="text-gray-400 font-normal">(Optional)</span>
                </span>
                {(customThumbnailFile || customThumbnailUrl) && (
                  <button
                    type="button"
                    onClick={() => { setCustomThumbnailFile(''); setCustomThumbnailUrl(''); }}
                    className="text-[10px] text-red-400 hover:underline font-bold"
                  >
                    Clear Thumbnail
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Upload Cover Image File
                  </label>
                  <input
                    type="file"
                    id="admin-thumb-file-u"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setCustomThumbnailFile(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="admin-thumb-file-u"
                    className="block text-center bg-[#1F2833] hover:bg-[#1F2833]/80 border border-gray-700 text-gray-300 font-bold px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                  >
                    {customThumbnailFile ? '✓ Image Attached' : 'Choose Cover Image File...'}
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Or Image URL
                  </label>
                  <input
                    type="url"
                    value={customThumbnailUrl}
                    onChange={(e) => setCustomThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#1F2833] border border-gray-700 rounded-lg p-2.5 text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>
              </div>

              {(customThumbnailFile || customThumbnailUrl) && (
                <div className="mt-2 p-2 bg-[#1F2833] rounded-lg border border-gray-700 flex items-center gap-3">
                  <img
                    src={customThumbnailFile || customThumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-16 h-10 object-cover rounded border border-[#FFD60A]"
                  />
                  <span className="text-[10px] text-[#FFD60A] font-bold">Custom thumbnail active</span>
                </div>
              )}
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
                  Duration (Sec) ({formatDuration(durationSec)})
                </label>
                <input
                  type="number"
                  value={durationSec}
                  onChange={(e) => setDurationSec(Number(e.target.value))}
                  min={10}
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-3 text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            {/* Initial Status Selection */}
            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                Approval Status *
              </label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as FilmStatus)}
                className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-3 text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
              >
                <option value="approved">Instant Approved (Appears on Public Feed)</option>
                <option value="pending">Pending Admin Review Queue</option>
              </select>
            </div>

            {/* Synopsis */}
            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                Overview / Synopsis
              </label>
              <textarea
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                rows={3}
                className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-3 text-[#F5F5F5] focus:outline-none focus:border-[#FFD60A]"
              />
            </div>
          </div>

          <button type="submit" className="btn-gold w-full text-xs py-3 font-bold shadow-xl">
            Save Film & Publish to Cinema Feed
          </button>
        </form>
      )}
    </div>
  );
}
