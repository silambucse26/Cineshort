/**
 * Google Drive Video URL validation and helper functions
 */

export function isSampleOrInvalidDriveUrl(url?: string): boolean {
  if (!url) return true;
  
  if (!url.includes('drive.google.com')) return false;

  // Known placeholder/sample patterns or simulated test drive file IDs that cause 404
  const sampleIdentifiers = [
    'simulated',
    'Sample',
    'sample',
    'PendingDriveId',
    '1qhj4FV7KJIq_NI2amVZIceo_kd2obsfa', // non-existent demo file
  ];

  if (sampleIdentifiers.some((identifier) => url.includes(identifier))) {
    return true;
  }

  // Extract ID from drive link and verify format
  const match = url.match(/\/d\/([^\/]+)/);
  if (match && match[1]) {
    const id = match[1];
    if (id.startsWith('simulated') || id.startsWith('sample') || id.length < 20) {
      return true;
    }
  }

  return false;
}

export function getDriveEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    // Ensure URL uses /preview format for embedding
    return url.replace(/\/view(\?.*)?$/, '/preview');
  }
  return url;
}

export function getDriveDirectStreamUrl(url: string): string {
  if (!url || !url.includes('drive.google.com')) return url;
  const match = url.match(/\/d\/([^\/]+)/) || url.match(/id=([^&]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return url;
}
