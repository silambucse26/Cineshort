/**
 * Google Drive Video URL validation and helper functions
 */

export function isSampleOrInvalidDriveUrl(url?: string): boolean {
  if (!url) return true;
  
  // If it's not a google drive link, it's not a google drive link
  if (!url.includes('drive.google.com')) return false;

  // Known placeholder/sample patterns or broken/simulated test drive file IDs
  const sampleIdentifiers = [
    'SampleDriveId',
    'PendingDriveId',
    'simulated',
    'drive-',
    'sample-',
    '1qhj4FV7KJIq_NI2amVZIceo_kd2obsfa', // non-existent demo file
  ];

  if (sampleIdentifiers.some((identifier) => url.includes(identifier))) {
    return true;
  }

  // Extract ID from drive link
  const match = url.match(/\/d\/([^\/]+)/);
  if (match && match[1]) {
    const id = match[1];
    if (id.startsWith('drive-') || id.startsWith('sample-') || id.length < 25) {
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
