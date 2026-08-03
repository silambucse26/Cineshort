'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Image as ImageIcon, 
  CheckCircle2, 
  Save, 
  ArrowLeft,
  Sparkles,
  Key,
  ShieldCheck,
  LogOut,
  Bookmark
} from 'lucide-react';
import { useShortFilm } from '../../context/ShortFilmContext';
import { FilmCard } from '../../components/FilmCard';

export default function UserProfilePage() {
  const router = useRouter();
  const { activePersona, isLoaded, updateUserProfile, logoutUser, logoutAdmin, wishlistFilmIds, films } = useShortFilm();

  // Guard for logged in users
  useEffect(() => {
    if (isLoaded && !activePersona?.email) {
      router.replace('/login?redirect=/profile');
    }
  }, [isLoaded, activePersona, router]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize fields once activePersona loads
  useEffect(() => {
    if (activePersona) {
      setName(activePersona.name || '');
      setPhone(activePersona.phone || '');
      setAvatarUrl(activePersona.avatar || '');
    }
  }, [activePersona]);

  if (!isLoaded || !activePersona?.email) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
        <div className="text-xs text-gray-400 font-bold animate-pulse uppercase tracking-widest">
          Loading profile...
        </div>
      </div>
    );
  }

  // Pre-set Avatar Presets (Dicebear seeds)
  const avatarPresets = [
    'Aarav', 'Kabir', 'Tara', 'Rohan', 'Sneha', 'Leo', 'Maya', 'Nisha'
  ].map(seed => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);

  const handleGenerateDicebear = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        setErrorMsg('Selected image size exceeds 1.5MB. Please choose a smaller file.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Name cannot be empty.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Phone number is required.');
      return;
    }

    // Password validation if they filled it in
    let validatedPassword: string | undefined = undefined;
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (newPassword.length < 5) {
        setErrorMsg('Password should be at least 5 characters.');
        return;
      }
      validatedPassword = newPassword;
    }

    setIsSaving(true);
    const result = await updateUserProfile(name, phone, avatarUrl, validatedPassword);
    setIsSaving(false);

    if (result.success) {
      setSuccessMsg('Profile details and credentials updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setErrorMsg(result.error || 'Failed to update profile.');
    }
  };

  const handleLogout = () => {
    logoutUser();
    logoutAdmin();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back navigation header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#FFD60A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home Feed
          </button>
          
          <div className="flex items-center gap-3">
            <div className="hidden xs:flex items-center gap-1.5 text-xs text-[#FFD60A] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD60A]" />
              <span>Account settings</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-[#E63946]/15 hover:bg-[#E63946] text-[#E63946] hover:text-white border border-[#E63946]/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Profile Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: AVATAR & PREVIEW */}
          <div className="lg:col-span-4 card-flat p-6 flex flex-col items-center text-center space-y-5 border border-[#FFD60A]/20">
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-gray-400">
              Avatar Editor
            </h2>
            
            {/* Avatar Preview */}
            <div className="relative group">
              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                alt={name}
                className="w-32 h-32 rounded-full object-cover border-4 border-[#FFD60A] shadow-[0_0_20px_rgba(255,214,10,0.15)] bg-[#0B0C10]"
              />
              <span className="absolute bottom-1 right-1 bg-[#FFD60A] text-[#0B0C10] p-1.5 rounded-full shadow-lg border border-[#0B0C10]">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </span>
            </div>

            {/* User Persona info */}
            <div>
              <div className="font-black text-base text-white">{name || 'User'}</div>
              <div className="text-[10px] text-[#FFD60A] uppercase font-bold tracking-widest mt-0.5">
                {activePersona.role} MEMBER
              </div>
            </div>

            {/* Quick Presets Selection */}
            <div className="w-full space-y-3 pt-4 border-t border-gray-700/40">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                Choose Preset Avatar
              </span>
              <div className="grid grid-cols-4 gap-2">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`rounded-lg overflow-hidden border p-0.5 transition-all bg-[#0B0C10] ${
                      avatarUrl === preset ? 'border-[#FFD60A] scale-105 shadow-md' : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <img src={preset} alt="preset" className="w-full aspect-square object-cover" />
                  </button>
                ))}
              </div>
              
              <button
                type="button"
                onClick={handleGenerateDicebear}
                className="w-full py-2 bg-[#1F2833] hover:bg-[#1F2833]/80 border border-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 text-gray-300"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFD60A]" />
                <span>Generate Random</span>
              </button>
            </div>

            {/* Account Logout Action Box */}
            <div className="w-full pt-4 border-t border-gray-700/40">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 bg-[#E63946]/10 hover:bg-[#E63946]/20 border border-[#E63946]/50 text-[#E63946] font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <LogOut className="w-4 h-4 text-[#E63946]" />
                <span>Log Out Account</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: DETAIL FORM */}
          <div className="lg:col-span-8 card-flat p-6 sm:p-8 space-y-6">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Profile & Security Credentials
            </h1>

            {/* Error/Success Feedbacks */}
            {errorMsg && (
              <div className="p-3 bg-red-950/20 border border-red-500/30 text-[#E63946] font-bold text-xs rounded-xl text-center">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-xl text-center">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#0B0C10] border border-gray-800 focus:border-[#FFD60A] px-4 py-3 rounded-lg text-[#F5F5F5] font-semibold outline-none transition-colors"
                  />
                </div>

                {/* Email (Read Only) */}
                <div className="space-y-1.5 opacity-60">
                  <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <input
                    type="email"
                    readOnly
                    value={activePersona.email || ''}
                    placeholder="No email linked"
                    className="w-full bg-[#1F2833] border border-gray-850 px-4 py-3 rounded-lg text-gray-400 font-semibold cursor-not-allowed outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full bg-[#0B0C10] border border-gray-800 focus:border-[#FFD60A] px-4 py-3 rounded-lg text-[#F5F5F5] font-semibold outline-none transition-colors"
                  />
                </div>

                {/* Custom Avatar Image Upload Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" /> Upload Custom Photo
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="avatar-file-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-file-upload"
                      className="flex-grow text-center bg-[#0B0C10] hover:bg-[#0B0C10]/80 border border-gray-800 hover:border-gray-700 text-gray-350 font-bold px-4 py-3 rounded-lg cursor-pointer transition-colors select-none"
                    >
                      {avatarUrl && avatarUrl.startsWith('data:') ? '✓ Photo Selected (Change)' : 'Choose Photo File...'}
                    </label>
                  </div>
                </div>

              </div>

              {/* Password Reset Block */}
              <div className="pt-6 border-t border-gray-700/40 space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#F4A300]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Reset Account Password
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400">
                  Fill in these fields only if you wish to change your plain-text security password. Leave blank to keep current password.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new plain text password"
                      className="w-full bg-[#0B0C10] border border-gray-800 focus:border-[#FFD60A] px-4 py-3 rounded-lg text-[#F5F5F5] font-semibold outline-none transition-colors"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retype new password"
                      className="w-full bg-[#0B0C10] border border-gray-800 focus:border-[#FFD60A] px-4 py-3 rounded-lg text-[#F5F5F5] font-semibold outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-gold font-extrabold text-xs px-6 py-3.5 shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-[#0B0C10]" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile Settings'}</span>
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* MY WISHLIST SECTION */}
        <div className="card-flat p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-700/50 pb-4">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-red-500 fill-current" />
              <h2 className="text-lg font-black text-[#F5F5F5] uppercase tracking-wider">
                My Saved Wishlist ({wishlistFilmIds.length})
              </h2>
            </div>
            {wishlistFilmIds.length > 0 && (
              <span className="text-xs text-gray-400 font-bold">
                {wishlistFilmIds.length} {wishlistFilmIds.length === 1 ? 'film saved' : 'films saved'}
              </span>
            )}
          </div>

          {wishlistFilmIds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {films
                .filter((f) => wishlistFilmIds.includes(f.id))
                .map((film) => (
                  <FilmCard key={film.id} film={film} />
                ))}
            </div>
          ) : (
            <div className="bg-[#0B0C10] p-8 text-center rounded-2xl border border-gray-800 space-y-3">
              <Bookmark className="w-10 h-10 text-gray-600 mx-auto" />
              <p className="text-xs text-gray-400 font-medium">Your wishlist is currently empty.</p>
              <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                Explore short films on Streamix and click the bookmark button to save them to your personal collection.
              </p>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="btn-gold text-xs px-5 py-2.5 inline-block font-extrabold shadow-md mt-2"
              >
                Browse Short Films
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
