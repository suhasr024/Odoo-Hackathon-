/**
 * Attachment Service Abstraction
 * Handles client-side validation and blob preview generation.
 * Ready for cloud/S3/backend upload adapter.
 */
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

    // In a real app with backend, this would upload to server/S3.
    // In demo mode, create a local object URL for preview.
    const previewUrl = URL.createObjectURL(file);
    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      previewUrl
    };
  }
};
