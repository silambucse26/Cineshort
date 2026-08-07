'use client';

import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  Star, 
  X, 
  Check, 
  MessageSquare, 
  Sliders, 
  Bot, 
  ThumbsUp, 
  Send, 
  ShieldCheck, 
  Film,
  TrendingUp,
  Clapperboard
} from 'lucide-react';
import { ShortFilm } from '@/types/shortfilm';
import { useShortFilm } from '@/context/ShortFilmContext';

interface MovieJudgeInsightModalProps {
  film: ShortFilm;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const MovieJudgeInsightModal: React.FC<MovieJudgeInsightModalProps> = ({
  film,
  isOpen,
  onClose,
  onSubmitted
}) => {
  const { rateFilm, addComment, activePersona } = useShortFilm();

  // 1. Jury Judge Rating Criteria (1-10)
  const [directionScore, setDirectionScore] = useState<number>(9);
  const [actingScore, setActingScore] = useState<number>(8);
  const [visualsScore, setVisualsScore] = useState<number>(9);
  const [soundScore, setSoundScore] = useState<number>(8);

  // 2. Quick Survey Questions
  const [selectedHighlight, setSelectedHighlight] = useState<string>('Mind-Bending Twist');
  const [pacingChoice, setPacingChoice] = useState<string>('Fast & Gripping');
  const [recommendation, setRecommendation] = useState<string>('100% Masterpiece - Must Watch');

  // 3. User Review Commentary & AI Insights
  const [userComment, setUserComment] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiShortReview, setAiShortReview] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<{
    verdict: string;
    keyThemes: string[];
    cinematicStrengths: string;
    recommendedFor: string;
  } | null>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  // Compute calculated overall Jury Score (Out of 10)
  const overallJuryScore = Number(
    ((directionScore + actingScore + visualsScore + soundScore) / 4).toFixed(1)
  );

  // Convert 10-point Jury score to 5-star equivalent for global rating system
  const starEquivalent = Math.min(5, Math.max(1, Math.round(overallJuryScore / 2)));

  const highlightOptions = [
    'Mind-Bending Twist',
    'Visual Spectacle',
    'Character Acting',
    'Atmospheric Audio',
    'Pacing & Editing'
  ];

  const pacingOptions = [
    'Fast & Gripping',
    'Perfectly Balanced',
    'Slow Burn Tension'
  ];

  const recommendationOptions = [
    '100% Masterpiece - Must Watch',
    'Worth Watching',
    'For Niche Fans Only'
  ];

  // AI Movie Insight & AI Short Review Synthesizer
  const handleGenerateAiInsight = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const commentSnippet = userComment.trim()
        ? `"${userComment.trim()}"`
        : 'focused on taut direction and high visual fidelity';

      const shortReview = `🤖 AI Short Synthesis: A ${film.mood_tag} film scoring ${overallJuryScore}/10 by jury standards. ${commentSnippet}. Standing out for its ${selectedHighlight.toLowerCase()} and ${pacingChoice.toLowerCase()} narrative structure.`;

      const insights = {
        verdict: overallJuryScore >= 8.5 ? '🏆 Festival Winner Caliber' : overallJuryScore >= 7.0 ? '⭐ Highly Commended Indie Short' : '🎬 Solid Experimental Piece',
        keyThemes: [film.mood_tag.toUpperCase(), selectedHighlight, 'Micro-Cinema Excellence'],
        cinematicStrengths: `Strong ${directionScore >= 8 ? 'directorial vision' : 'framing'} paired with ${soundScore >= 8 ? 'immersive sound design' : 'solid pacing'}.`,
        recommendedFor: `Aficionados of ${film.mood_tag} cinema and lovers of micro short-film storytelling.`
      };

      setAiShortReview(shortReview);
      setAiInsights(insights);
      setIsGeneratingAi(false);
    }, 600);
  };

  const handleSubmitJudgeScore = () => {
    // 1. Submit rating to film context
    rateFilm(film.id, starEquivalent);

    // 2. Submit formatted Jury review & AI short review to comments
    const reviewPayload = [
      `🏛️ **JURY JUDGE SCORE: ${overallJuryScore}/10** (${starEquivalent}★ equivalent)`,
      `• Direction & Story: ${directionScore}/10 | Acting: ${actingScore}/10 | Visuals: ${visualsScore}/10 | Audio: ${soundScore}/10`,
      `• Key Highlight: ${selectedHighlight} | Pacing: ${pacingChoice}`,
      userComment ? `• Review: "${userComment}"` : null,
      aiShortReview ? `\n${aiShortReview}` : null
    ]
      .filter(Boolean)
      .join('\n');

    addComment(film.id, reviewPayload);
    setIsSubmitted(true);

    if (onSubmitted) {
      onSubmitted();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0B0C10] border border-[#FFD60A]/40 w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(255,214,10,0.2)] text-[#F5F5F5] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#1F2833]/80 p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F4A300] to-[#FFD60A] text-[#0B0C10] flex items-center justify-center font-black shadow-md">
              <Award className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[#FFD60A] text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> Jury & AI Review Suite
              </div>
              <h2 className="font-extrabold text-base sm:text-lg text-white line-clamp-1">
                Score "{film.title}" as a Judge
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {isSubmitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFD60A]/20 border-2 border-[#FFD60A] text-[#FFD60A] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,214,10,0.4)]">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white uppercase tracking-wider">Jury Verdict Submitted!</h3>
                <p className="text-xs text-gray-300 max-w-md mx-auto">
                  Your official Jury Judge Score of <strong className="text-[#FFD60A] font-bold">{overallJuryScore}/10</strong> and AI Short Review have been recorded into the film catalog.
                </p>
              </div>
              <button
                onClick={onClose}
                className="btn-gold text-xs px-6 py-2.5 font-bold uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Overall Judge Score Card */}
              <div className="bg-gradient-to-r from-[#1F2833] via-[#0B0C10] to-[#1F2833] p-4 rounded-xl border border-[#FFD60A]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-0.5">
                    Calculated Jury Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-[#FFD60A] tracking-tight">
                      {overallJuryScore}
                    </span>
                    <span className="text-xs text-gray-400 font-bold">/ 10</span>
                    <span className="bg-[#FFD60A]/10 border border-[#FFD60A]/30 text-[#FFD60A] text-[10px] font-black px-2 py-0.5 rounded-md ml-2">
                      {starEquivalent} ★ Rating
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">Judge Persona</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FFD60A]" />
                    {activePersona.name}
                  </span>
                </div>
              </div>

              {/* 1. Jury Score Sliders */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-[#FFD60A] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#FFD60A]" />
                  1. Jury Breakdown (1-10 Scale)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#1F2833]/40 p-4 rounded-xl border border-white/5">
                  {/* Direction */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-300">🎬 Direction & Story</span>
                      <span className="text-[#FFD60A] font-black">{directionScore}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={directionScore}
                      onChange={(e) => setDirectionScore(Number(e.target.value))}
                      className="w-full accent-[#FFD60A] cursor-pointer"
                    />
                  </div>

                  {/* Acting */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-300">🎭 Acting & Performance</span>
                      <span className="text-[#FFD60A] font-black">{actingScore}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={actingScore}
                      onChange={(e) => setActingScore(Number(e.target.value))}
                      className="w-full accent-[#FFD60A] cursor-pointer"
                    />
                  </div>

                  {/* Visuals */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-300">🎥 Cinematography</span>
                      <span className="text-[#FFD60A] font-black">{visualsScore}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={visualsScore}
                      onChange={(e) => setVisualsScore(Number(e.target.value))}
                      className="w-full accent-[#FFD60A] cursor-pointer"
                    />
                  </div>

                  {/* Sound */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-300">🎵 Sound & Score</span>
                      <span className="text-[#FFD60A] font-black">{soundScore}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={soundScore}
                      onChange={(e) => setSoundScore(Number(e.target.value))}
                      className="w-full accent-[#FFD60A] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Common Survey Questions */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-[#FFD60A] uppercase tracking-wider flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-[#FFD60A]" />
                  2. Common Movie Questions
                </h3>

                <div className="space-y-3 bg-[#1F2833]/40 p-4 rounded-xl border border-white/5 text-xs">
                  {/* Highlight */}
                  <div>
                    <label className="block text-gray-300 font-bold mb-1.5">What stood out the most?</label>
                    <div className="flex flex-wrap gap-1.5">
                      {highlightOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedHighlight(opt)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                            selectedHighlight === opt
                              ? 'bg-[#FFD60A] text-[#0B0C10] border-[#FFD60A] font-extrabold shadow-sm'
                              : 'bg-[#0B0C10] text-gray-300 border-white/10 hover:border-white/30'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pacing */}
                  <div>
                    <label className="block text-gray-300 font-bold mb-1.5">How was the film pacing?</label>
                    <div className="flex flex-wrap gap-1.5">
                      {pacingOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setPacingChoice(opt)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                            pacingChoice === opt
                              ? 'bg-[#FFD60A] text-[#0B0C10] border-[#FFD60A] font-extrabold shadow-sm'
                              : 'bg-[#0B0C10] text-gray-300 border-white/10 hover:border-white/30'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div>
                    <label className="block text-gray-300 font-bold mb-1.5">Jury Recommendation</label>
                    <div className="flex flex-wrap gap-1.5">
                      {recommendationOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setRecommendation(opt)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                            recommendation === opt
                              ? 'bg-gradient-to-r from-[#F4A300] to-[#FFD60A] text-[#0B0C10] border-[#FFD60A] font-extrabold shadow-sm'
                              : 'bg-[#0B0C10] text-gray-300 border-white/10 hover:border-white/30'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Commentary & AI Insights */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-[#FFD60A] uppercase tracking-wider flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-[#FFD60A]" />
                    3. Commentary & AI Movie Insight
                  </h3>

                  <button
                    type="button"
                    onClick={handleGenerateAiInsight}
                    disabled={isGeneratingAi}
                    className="bg-[#FFD60A]/10 hover:bg-[#FFD60A]/20 border border-[#FFD60A]/40 text-[#FFD60A] px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 text-[#FFD60A]" />
                    {isGeneratingAi ? 'Synthesizing AI...' : 'Generate AI Review'}
                  </button>
                </div>

                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Write your critical commentary as a judge (optional)... e.g. Brilliant lighting, tense sound design, gripping performance."
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD60A] min-h-[70px]"
                />

                {/* AI Review Output Display Box */}
                {aiShortReview && (
                  <div className="bg-[#1F2833] border border-[#FFD60A]/40 rounded-xl p-3.5 space-y-2 text-xs animate-fadeIn shadow-lg">
                    <div className="flex items-center gap-1.5 text-[#FFD60A] font-bold text-[11px]">
                      <Bot className="w-4 h-4 text-[#FFD60A]" />
                      <span>AI Short Review & Analysis</span>
                    </div>
                    <p className="text-gray-200 leading-relaxed font-medium">
                      {aiShortReview}
                    </p>
                    {aiInsights && (
                      <div className="pt-2 border-t border-gray-700/60 grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-gray-400 block font-bold">Verdict:</span>
                          <span className="text-[#FFD60A] font-black">{aiInsights.verdict}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-bold">Recommended Audience:</span>
                          <span className="text-gray-200">{aiInsights.recommendedFor}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!isSubmitted && (
          <div className="bg-[#1F2833]/80 p-4 border-t border-white/10 flex items-center justify-between shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitJudgeScore}
              className="btn-gold text-xs px-6 py-2.5 font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,214,10,0.3)] hover:scale-105 active:scale-95 transition-transform"
            >
              <Send className="w-4 h-4 text-[#0B0C10]" />
              <span>Submit Jury Review</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
