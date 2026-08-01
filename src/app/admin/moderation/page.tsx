'use client';

import React from 'react';
import { 
  MessageSquareWarning, 
  Trash2, 
  Flag, 
  CheckCircle2, 
  AlertTriangle, 
  User 
} from 'lucide-react';
import { useShortFilm } from '@/context/ShortFilmContext';

export default function AdminModerationPage() {
  const { comments, deleteComment, toggleFlagComment, films } = useShortFilm();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card-flat p-6 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-purple-500/15 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <MessageSquareWarning className="w-3.5 h-3.5" /> Comment Moderation
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] mt-1">Community Moderation</h1>
          <p className="text-xs text-gray-300">
            Review viewer feedback, inspect reported content, and remove spam or abusive comments.
          </p>
        </div>

        <div className="bg-[#0B0C10] px-4 py-2 rounded-xl border border-gray-800 text-xs text-[#F5F5F5]">
          <span className="text-gray-400">Total Comments: </span>
          <strong className="text-[#FFD60A] text-sm">{comments.length}</strong>
        </div>
      </div>

      {/* Comment Moderation Table */}
      <div className="card-flat p-6 space-y-4">
        <h2 className="font-bold text-base text-[#F5F5F5]">Comment Stream</h2>

        <div className="space-y-3">
          {comments.map((comm) => {
            const film = films.find((f) => f.id === comm.film_id);

            return (
              <div
                key={comm.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  comm.is_flagged
                    ? 'bg-[#E63946]/10 border-[#E63946]/50'
                    : 'bg-[#0B0C10] border-gray-800'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={comm.user_avatar}
                    alt={comm.user_name}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-[#F5F5F5]">{comm.user_name}</span>

                      {comm.is_verified && (
                        <span className="bg-[#F4A300]/20 text-[#F4A300] text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                          Verified {comm.user_role}
                        </span>
                      )}

                      {comm.is_flagged && (
                        <span className="bg-[#E63946] text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Flagged / Reported
                        </span>
                      )}

                      {film && (
                        <span className="text-[10px] text-gray-500 truncate">
                          On: <strong className="text-gray-300">{film.title}</strong>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">{comm.text}</p>
                    <span className="text-[10px] text-gray-500 block">{comm.timestamp}</span>
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => toggleFlagComment(comm.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      comm.is_flagged
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-[#E63946]/20 text-[#E63946] hover:bg-[#E63946] hover:text-white'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{comm.is_flagged ? 'Unflag' : 'Flag Spam'}</span>
                  </button>

                  <button
                    onClick={() => deleteComment(comm.id)}
                    className="p-2 text-gray-400 hover:text-[#E63946] hover:bg-[#0B0C10] rounded-lg transition-colors"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
