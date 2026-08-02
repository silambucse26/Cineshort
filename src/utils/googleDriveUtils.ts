/**
 * Google Drive Video URL validation and helper functions
 */

export function isSampleOrInvalidDriveUrl(url?: string): boolean {
  if (!url) return true;
  
  if (!url.includes('drive.google.com')) return false;

  // Known placeholder/sample demo patterns
  const sampleIdentifiers = [
    '1Bzi-KXJ_05sX1J5T_SampleDriveId1',
    '1Azi-KXJ_05sX2J5T_SampleDriveId2',
    '1qhj4FV7KJIq_NI2amVZIceo_kd2obsfa',
  ];

  if (sampleIdentifiers.some((identifier) => url.includes(identifier))) {
    return true;
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
