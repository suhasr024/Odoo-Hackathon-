/**
 * IndexedDB Storage Adapter for Attachments & Large Blobs
 * Prevents localStorage quota exhaustion (5-10MB browser limit) by storing raw file blobs in IndexedDB.
 *
 * // TODO: Replace indexedDbAdapter with direct multipart upload to backend / S3 once backend API is connected.
 */

const DB_NAME = 'vantage_hrms_files';
const DB_VERSION = 1;
const STORE_NAME = 'attachments';

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported in this environment.');
      return resolve(null);
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
};

export const indexedDbAdapter = {
  async saveAttachment(id, file) {
    const db = await openDB();
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const record = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        data: file, // Store File or Blob
        createdAt: new Date().toISOString()
      };

      const request = store.put(record);
      request.onsuccess = () => resolve(id);
      request.onerror = (e) => reject(e.target.error);
    });
  },

  async getAttachment(id) {
    const db = await openDB();
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = (e) => {
        const record = e.target.result;
        if (record && record.data) {
          const blobUrl = URL.createObjectURL(record.data);
          resolve({
            ...record,
            blobUrl
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = (e) => reject(e.target.error);
    });
  },

  async deleteAttachment(id) {
    const db = await openDB();
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  }
};
