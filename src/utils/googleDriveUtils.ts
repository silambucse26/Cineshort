/**
 * Google Drive Video URL validation and helper functions
 */

export function extractDriveFileId(url?: string): string | null {
  if (!url || !url.includes('drive.google.com')) return null;
  const match = url.match(/\/d\/([^\/\?#]+)/) || url.match(/[?&]id=([^&]+)/);
  return match && match[1] ? match[1] : null;
}

export function isSampleOrInvalidDriveUrl(url?: string): boolean {
  if (!url) return true;
  if (!url.includes('drive.google.com')) return false;

  const sampleIdentifiers = [
    'simulated',
    'PendingDriveId',
    '1qhj4FV7KJIq_NI2amVZIceo_kd2obsfa', // known dead placeholder ID
  ];

  if (sampleIdentifiers.some((identifier) => url.includes(identifier))) {
    return true;
  }

  const id = extractDriveFileId(url);
  if (id && (id.startsWith('simulated') || id.length < 15)) {
    return true;
  }

  return false;
}

export function getDriveEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const id = extractDriveFileId(url);
    if (id) {
      return `https://drive.google.com/file/d/${id}/preview`;
    }
    return url.replace(/\/view(\?.*)?$/, '/preview');
  }
  return url;
}

export function getDriveDirectStreamUrl(url: string): string {
  if (!url || !url.includes('drive.google.com')) return url;
  const id = extractDriveFileId(url);
  if (id) {
    return `https://lh3.googleusercontent.com/d/${id}`;
  }
  return url;
}

