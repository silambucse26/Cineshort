'use client';

import React, { useState, useRef } from 'react';
import { 
  Film, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Search, 
  User, 
  X, 
  Save, 
  Sparkles,
  Plus,
  Image as ImageIcon,
  Users
} from 'lucide-react';
import { useShortFilm } from '@/context/ShortFilmContext';
import { ShortFilm, Director, Hero, FilmStatus, MoodTag } from '@/types/shortfilm';
import { formatDuration } from '@/services/driveService';

export default function AdminManageContentPage() {
  const { 
    films, 
    directors, 
    heroes, 
    updateFilm, 
    deleteFilm, 
    updateDirector, 
    updateHero, 
    deleteDirector, 
    deleteHero, 
    addDirector, 
    addHero 
  } = useShortFilm();

  const [activeTab, setActiveTab] = useState<'films' | 'directors' | 'heroes'>('films');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals / Editing states
  const [editingFilm, setEditingFilm] = useState<ShortFilm | null>(null);
  
  const [editingDirector, setEditingDirector] = useState<Director | null>(null);
  const [isAddingDirector, setIsAddingDirector] = useState(false);
  const [directorName, setDirectorName] = useState('');
  const [directorBio, setDirectorBio] = useState('');
  const [directorPic, setDirectorPic] = useState('');

  const [editingHero, setEditingHero] = useState<Hero | null>(null);
  const [isAddingHero, setIsAddingHero] = useState(false);
  const [heroName, setHeroName] = useState('');
  const [heroBio, setHeroBio] = useState('');
  const [heroPic, setHeroPic] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // FileReader image handlers
  const handleDirectorImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        setErrorMsg('Image file size exceeds 1.5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit && editingDirector) {
          setEditingDirector({ ...editingDirector, profile_pic_url: reader.result as string });
        } else {
          setDirectorPic(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        setErrorMsg('Image file size exceeds 1.5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit && editingHero) {
          setEditingHero({ ...editingHero, profile_pic_url: reader.result as string });
        } else {
          setHeroPic(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Film actions
  const handleSaveFilmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFilm) return;
    updateFilm(editingFilm.id, editingFilm);
    setEditingFilm(null);
  };

  // Director Actions
  const handleOpenAddDirector = () => {
    setDirectorName('');
    setDirectorBio('');
    setDirectorPic('');
    setIsAddingDirector(true);
  };

  const handleSaveAddDirector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directorName.trim()) return;
    addDirector({
      name: directorName.trim(),
      bio: directorBio.trim() || 'Emerging short filmmaker.',
      profile_pic_url: directorPic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'
    });
    setIsAddingDirector(false);
  };

  const handleSaveDirectorEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDirector) return;
    updateDirector(editingDirector.id, editingDirector);
    setEditingDirector(null);
  };

  // Hero Actions
  const handleOpenAddHero = () => {
    setHeroName('');
    setHeroBio('');
    setHeroPic('');
    setIsAddingHero(true);
  };

  const handleSaveAddHero = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroName.trim()) return;
    addHero({
      name: heroName.trim(),
      bio: heroBio.trim() || 'Independent short film performer.',
      profile_pic_url: heroPic || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80'
    });
    setIsAddingHero(false);
  };

  const handleSaveHeroEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHero) return;
    updateHero(editingHero.id, editingHero);
    setEditingHero(null);
  };

  // Filtered lists
  const filteredFilms = films.filter(
    (f) =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.director_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.mood_tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDirectors = directors.filter(
    (d) => d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHeroes = heroes.filter(
    (h) => h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header card with tab switchers */}
      <div className="card-flat p-6 border border-[#F4A300]/40 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#F4A300]/15 text-[#F4A300] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Film className="w-3.5 h-3.5" /> Database Content Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] mt-1">Manage Content</h1>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-[#0B0C10] p-1.5 rounded-xl border border-gray-800 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('films'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'films' ? 'bg-[#FFD60A] text-[#0B0C10] font-bold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Films ({films.length})
          </button>
          <button
            onClick={() => { setActiveTab('directors'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'directors' ? 'bg-[#FFD60A] text-[#0B0C10] font-bold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Directors ({directors.length})
          </button>
          <button
            onClick={() => { setActiveTab('heroes'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'heroes' ? 'bg-[#FFD60A] text-[#0B0C10] font-bold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Heroes ({heroes.length})
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/20 border border-red-500/30 text-[#E63946] text-xs font-bold rounded-lg text-center">
          {errorMsg}
        </div>
      )}

      {/* SEARCH BAR & ADD ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center bg-[#1F2833] border border-gray-700 rounded-xl px-4 py-2.5 text-xs w-full sm:max-w-xs shadow-inner">
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-[#F5F5F5] w-full focus:outline-none font-medium"
          />
        </div>

        {activeTab === 'directors' && (
          <button
            onClick={handleOpenAddDirector}
            className="w-full sm:w-auto btn-gold text-xs font-extrabold px-4 py-2.5 shadow-lg flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#0B0C10]" />
            <span>Create Director</span>
          </button>
        )}

        {activeTab === 'heroes' && (
          <button
            onClick={handleOpenAddHero}
            className="w-full sm:w-auto btn-gold text-xs font-extrabold px-4 py-2.5 shadow-lg flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#0B0C10]" />
            <span>Create Hero</span>
          </button>
        )}
      </div>

      {/* FILMS TAB CATALOG */}
      {activeTab === 'films' && (
        <div className="card-flat p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0C10] text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-3">Film Details</th>
                  <th className="p-3">Director</th>
                  <th className="p-3">Mood</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Avg Rating</th>
                  <th className="p-3">Upload Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {filteredFilms.map((film) => (
                  <tr key={film.id} className="hover:bg-[#0B0C10]/40 transition-colors">
                    <td className="p-3 flex items-center gap-3">
                      <img src={film.thumbnail_url} alt={film.title} className="w-12 h-9 rounded object-cover border border-gray-800 shadow" />
                      <span className="font-extrabold text-[#F5F5F5]">{film.title}</span>
                    </td>
                    <td className="p-3 text-gray-300">{film.director_name}</td>
                    <td className="p-3">
                      <span className="tag-red text-[9px]">{film.mood_tag}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        film.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-450 border border-emerald-500/30'
                          : film.status === 'pending'
                          ? 'bg-[#F4A300]/20 text-[#F4A300] border border-[#F4A300]/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {film.status}
                      </span>
                    </td>
                    <td className="p-3 text-[#F4A300] font-black">★ {film.rating_avg.toFixed(1)}</td>
                    <td className="p-3 text-gray-400">{film.upload_date}</td>
                    <td className="p-3 text-right space-x-1 shrink-0">
                      <button
                        onClick={() => setEditingFilm({ ...film })}
                        className="p-2 text-[#FFD60A] hover:bg-[#0B0C10] rounded-lg transition-colors"
                        title="Edit Film"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFilm(film.id)}
                        className="p-2 text-gray-400 hover:text-[#E63946] hover:bg-[#0B0C10] rounded-lg transition-colors"
                        title="Delete Film"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DIRECTORS TAB CATALOG */}
      {activeTab === 'directors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDirectors.map((dir) => (
            <div key={dir.id} className="card-flat p-5 flex justify-between items-start gap-4 border border-gray-700/50">
              <div className="flex gap-4 min-w-0">
                <img src={dir.profile_pic_url} alt={dir.name} className="w-16 h-16 rounded-full object-cover border border-[#F4A300] shrink-0" />
                <div className="min-w-0 space-y-1">
                  <h3 className="font-extrabold text-sm text-[#F5F5F5] truncate">{dir.name}</h3>
                  <p className="text-xs text-[#F4A300] font-bold">★ {dir.avg_rating} Avg • {(dir.follower_count ?? 0)} Followers</p>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{dir.bio}</p>
                </div>
              </div>
              
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setEditingDirector({ ...dir })}
                  className="p-2 text-[#FFD60A] hover:bg-[#0B0C10] rounded-lg transition-colors"
                  title="Edit Director"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteDirector(dir.id)}
                  className="p-2 text-gray-400 hover:text-[#E63946] hover:bg-[#0B0C10] rounded-lg transition-colors"
                  title="Delete Director"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HEROES TAB CATALOG */}
      {activeTab === 'heroes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHeroes.map((hero) => (
            <div key={hero.id} className="card-flat p-5 flex flex-col items-center text-center justify-between border border-gray-700/50 gap-4">
              <div className="space-y-2">
                <img src={hero.profile_pic_url} alt={hero.name} className="w-16 h-16 rounded-full object-cover border border-[#FFD60A]" />
                <h3 className="font-extrabold text-sm text-[#F5F5F5]">{hero.name}</h3>
                <p className="text-xs text-gray-450 leading-relaxed line-clamp-3">{hero.bio}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-800 w-full justify-center">
                <button
                  onClick={() => setEditingHero({ ...hero })}
                  className="px-3 py-1.5 bg-[#0B0C10] hover:bg-[#0B0C10]/80 border border-gray-800 hover:border-gray-750 text-[#FFD60A] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  title="Edit Hero"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => deleteHero(hero.id)}
                  className="px-3 py-1.5 bg-[#0B0C10] hover:bg-[#0B0C10]/80 border border-gray-800 hover:border-gray-750 text-gray-400 hover:text-[#E63946] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  title="Delete Hero"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* MODAL 1: EDIT FILM */}
      {editingFilm && (
        <div className="fixed inset-0 z-50 bg-[#0B0C10]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-flat p-6 max-w-lg w-full border border-[#F4A300]/50 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
              <h3 className="font-extrabold text-base text-[#F5F5F5]">Edit Short Film</h3>
              <button onClick={() => setEditingFilm(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFilmEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={editingFilm.title}
                  onChange={(e) => setEditingFilm({ ...editingFilm, title: e.target.value })}
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-2.5 text-[#F5F5F5] font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-300 mb-1.5">Status</label>
                  <select
                    value={editingFilm.status}
                    onChange={(e) => setEditingFilm({ ...editingFilm, status: e.target.value as FilmStatus })}
                    className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-2.5 text-[#F5F5F5] font-semibold"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1.5">Mood</label>
                  <select
                    value={editingFilm.mood_tag}
                    onChange={(e) => setEditingFilm({ ...editingFilm, mood_tag: e.target.value as MoodTag })}
                    className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-2.5 text-[#F5F5F5] font-semibold"
                  >
                    <option value="thriller">Thriller</option>
                    <option value="uplifting">Uplifting</option>
                    <option value="dark">Dark</option>
                    <option value="romantic">Romantic</option>
                    <option value="comedy">Comedy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1.5">Overview</label>
                <textarea
                  value={editingFilm.overview}
                  onChange={(e) => setEditingFilm({ ...editingFilm, overview: e.target.value })}
                  rows={3}
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-2.5 text-[#F5F5F5] font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingFilm(null)} className="px-4 py-2 text-gray-400 font-bold hover:text-white">
                  Cancel
                </button>
                <button type="submit" className="btn-gold text-xs px-5 py-2 font-black flex items-center gap-1.5 shadow-lg">
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD DIRECTOR */}
      {isAddingDirector && (
        <div className="fixed inset-0 z-50 bg-[#0B0C10]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-flat p-6 max-w-md w-full border border-[#FFD60A]/50 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
              <h3 className="font-extrabold text-base text-[#F5F5F5]">Add New Director</h3>
              <button onClick={() => setIsAddingDirector(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddDirector} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  placeholder="Director name"
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-2.5 text-[#F5F5F5]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1.5">Bio Details</label>
                <textarea
                  value={directorBio}
                  onChange={(e) => setDirectorBio(e.target.value)}
                  placeholder="Short professional bio..."
                  rows={3}
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-2.5 text-[#F5F5F5]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1.5">Profile Picture File</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="dir-add-pic"
                    accept="image/*"
                    onChange={(e) => handleDirectorImageUpload(e, false)}
                    className="hidden"
                  />
                  <label
                    htmlFor="dir-add-pic"
                    className="flex-grow text-center bg-[#0B0C10] hover:bg-[#0B0C10]/80 border border-gray-800 text-gray-300 font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                  >
                    {directorPic ? '✓ Image Loaded' : 'Upload Image File...'}
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddingDirector(false)} className="px-4 py-2 text-gray-400">
                  Cancel
                </button>
                <button type="submit" className="btn-gold text-xs px-5 py-2 font-black flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Create Director
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT DIRECTOR */}
      {editingDirector && (
        <div className="fixed inset-0 z-50 bg-[#0B0C10]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-flat p-6 max-w-md w-full border border-[#FFD60A]/50 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
              <h3 className="font-extrabold text-base text-[#F5F5F5]">Edit Director Profile</h3>
              <button onClick={() => setEditingDirector(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDirectorEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingDirector.name}
                  onChange={(e) => setEditingDirector({ ...editingDirector, name: e.target.value })}
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-2.5 text-[#F5F5F5] font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1.5">Bio Details</label>
                <textarea
                  value={editingDirector.bio}
                  onChange={(e) => setEditingDirector({ ...editingDirector, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-2.5 text-[#F5F5F5] font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1.5">Upload New Profile Picture</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="dir-edit-pic"
                    accept="image/*"
                    onChange={(e) => handleDirectorImageUpload(e, true)}
                    className="hidden"
                  />
                  <label
                    htmlFor="dir-edit-pic"
                    className="flex-grow text-center bg-[#0B0C10] hover:bg-[#0B0C10]/80 border border-gray-800 text-gray-300 font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                  >
                    {editingDirector.profile_pic_url.startsWith('data:') ? '✓ Photo Selected' : 'Replace Image File...'}
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingDirector(null)} className="px-4 py-2 text-gray-400">
                  Cancel
                </button>
                <button type="submit" className="btn-gold text-xs px-5 py-2 font-black flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD HERO */}
      {isAddingHero && (
        <div className="fixed inset-0 z-50 bg-[#0B0C10]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-flat p-6 max-w-md w-full border border-[#FFD60A]/50 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
              <h3 className="font-extrabold text-base text-[#F5F5F5]">Add New Hero</h3>
              <button onClick={() => setIsAddingHero(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddHero} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1.5">Cast Name</label>
                <input
                  type="text"
                  required
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  placeholder="Actor name"
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-2.5 text-[#F5F5F5]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1.5">Bio/Filmography Description</label>
                <textarea
                  value={heroBio}
                  onChange={(e) => setHeroBio(e.target.value)}
                  placeholder="Short description/notable roles..."
                  rows={3}
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-2.5 text-[#F5F5F5]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1.5">Profile Picture File</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="hero-add-pic"
                    accept="image/*"
                    onChange={(e) => handleHeroImageUpload(e, false)}
                    className="hidden"
                  />
                  <label
                    htmlFor="hero-add-pic"
                    className="flex-grow text-center bg-[#0B0C10] hover:bg-[#0B0C10]/80 border border-gray-800 text-gray-300 font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                  >
                    {heroPic ? '✓ Image Loaded' : 'Upload Image File...'}
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddingHero(false)} className="px-4 py-2 text-gray-400">
                  Cancel
                </button>
                <button type="submit" className="btn-gold text-xs px-5 py-2 font-black flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Create Hero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT HERO */}
      {editingHero && (
        <div className="fixed inset-0 z-50 bg-[#0B0C10]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-flat p-6 max-w-md w-full border border-[#FFD60A]/50 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
              <h3 className="font-extrabold text-base text-[#F5F5F5]">Edit Hero Profile</h3>
              <button onClick={() => setEditingHero(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHeroEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1.5">Cast Name</label>
                <input
                  type="text"
                  required
                  value={editingHero.name}
                  onChange={(e) => setEditingHero({ ...editingHero, name: e.target.value })}
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-2.5 text-[#F5F5F5] font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1.5">Bio Details</label>
                <textarea
                  value={editingHero.bio}
                  onChange={(e) => setEditingHero({ ...editingHero, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg p-2.5 text-[#F5F5F5] font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1.5">Upload New Profile Picture</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="hero-edit-pic"
                    accept="image/*"
                    onChange={(e) => handleHeroImageUpload(e, true)}
                    className="hidden"
                  />
                  <label
                    htmlFor="hero-edit-pic"
                    className="flex-grow text-center bg-[#0B0C10] hover:bg-[#0B0C10]/80 border border-gray-800 text-gray-300 font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                  >
                    {editingHero.profile_pic_url.startsWith('data:') ? '✓ Photo Selected' : 'Replace Image File...'}
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingHero(null)} className="px-4 py-2 text-gray-400">
                  Cancel
                </button>
                <button type="submit" className="btn-gold text-xs px-5 py-2 font-black flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
