/**
 * Attachment Service Abstraction
 * Handles client-side validation and isolates raw file storage in IndexedDB to protect localStorage quota.
 *
 * // TODO: Replace indexedDbAdapter with real backend/S3 multipart upload endpoint once backend is active.
 */
import { indexedDbAdapter } from './storage/indexedDbAdapter';

export const ALLOWED_ATTACHMENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf'
];

export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const attachmentService = {
  validateFile(file) {
    if (!file) return { isValid: true };

    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Allowed formats: PNG, JPG, JPEG, PDF.'
      };
    }

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      return {
        isValid: false,
        error: 'File size exceeds the 10 MB limit.'
      };
    }

    return { isValid: true };
  },

  async processAttachment(file) {
    if (!file) return null;

    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const storageKey = `att_file_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Save binary data to IndexedDB
    try {
      await indexedDbAdapter.saveAttachment(storageKey, file);
    } catch (err) {
      console.warn('IndexedDB save failed, falling back to local object URL:', err);
    }

    const previewUrl = URL.createObjectURL(file);

    // Return lightweight metadata only (stored in localStorage without bloat)
    return {
      storageKey,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadDate: new Date().toISOString(),
      previewUrl
    };
  }
};
