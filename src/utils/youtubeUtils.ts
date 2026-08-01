/**
 * YouTube Utility Helper Functions
 * Parses YouTube URLs, extracts video IDs, builds embed links, and fetches thumbnails.
 */

/**
 * Extracts 11-character YouTube Video ID from various URL formats
 * Examples supported:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // If input is already just an 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);

  return match && match[1].length === 11 ? match[1] : null;
}

/**
 * Builds clean YouTube embed player URL with cinema settings
 */
export function getYouTubeEmbedUrl(youtubeId: string, options: { autoplay?: boolean } = {}): string {
  if (!youtubeId) return '';
  const cleanId = extractYouTubeId(youtubeId) || youtubeId;
  const autoplayParam = options.autoplay ? '1' : '0';
  return `https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=${autoplayParam}&modestbranding=1&rel=0&enablejsapi=1&color=white`;
}

/**
 * Returns YouTube video high quality thumbnail image URL
 */
export function getYouTubeThumbnail(youtubeId: string): string {
  const cleanId = extractYouTubeId(youtubeId) || youtubeId;
  if (!cleanId) return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80';
  return `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`;
}

/**
 * Checks whether a given string is a valid YouTube video URL or ID
 */
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}
