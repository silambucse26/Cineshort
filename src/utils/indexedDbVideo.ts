/**
 * IndexedDB Utility for storing and retrieving uploaded video files persistently in browser storage.
 */

const DB_NAME = 'StreamixVideoStore';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_videos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject('IndexedDB not supported in this environment');
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a video Blob/File to IndexedDB under a specific film key.
 */
export async function saveUploadedVideo(filmId: string, videoBlob: Blob): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(videoBlob, filmId);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to save video to IndexedDB:', err);
    return false;
  }
}

/**
 * Get a stored video Blob from IndexedDB by film key.
 */
export async function getUploadedVideoBlob(filmId: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(filmId);

      request.onsuccess = () => {
        const blob = request.result;
        if (blob && (blob instanceof Blob || blob instanceof File)) {
          resolve(blob);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to fetch video from IndexedDB:', err);
    return null;
  }
}

/**
 * Create a fresh object URL for a stored video in IndexedDB.
 */
export async function getUploadedVideoObjectUrl(filmId: string): Promise<string | null> {
  const blob = await getUploadedVideoBlob(filmId);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return null;
}
