import { storageAdapter } from './storage/storageAdapter';
import { indexedDbAdapter } from './storage/indexedDbAdapter';
import { INITIAL_DOCUMENTS } from '../data/mockData';

const DOCUMENTS_KEY = 'user_documents_db';

export const documentService = {
  async init() {
    let docs = await storageAdapter.get(DOCUMENTS_KEY);
    if (!docs) {
      await storageAdapter.set(DOCUMENTS_KEY, INITIAL_DOCUMENTS);
    }
  },

  async getDocuments(employeeId) {
    await this.init();
    const allDocs = await storageAdapter.get(DOCUMENTS_KEY, INITIAL_DOCUMENTS);
    return allDocs[employeeId] || [];
  },

  async uploadDocument(employeeId, file) {
    await this.init();

    if (!file) throw new Error('No file provided.');

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file format. Allowed formats: PNG, JPG, PDF.');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds the 10 MB limit.');
    }

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Save binary data to IndexedDB
    try {
      await indexedDbAdapter.saveAttachment(docId, file);
    } catch (e) {
      console.warn('IndexedDB save failed for document:', e);
    }

    const fileSizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const newDoc = {
      id: docId,
      name: file.name,
      type: file.type.includes('pdf') ? 'Tax & Legal Document' : 'ID Proof / Certificate',
      fileType: file.type,
      size: fileSizeStr,
      uploadedDate: new Date().toISOString().split('T')[0]
    };

    const allDocs = await storageAdapter.get(DOCUMENTS_KEY, INITIAL_DOCUMENTS);
    if (!allDocs[employeeId]) {
      allDocs[employeeId] = [];
    }
    allDocs[employeeId].unshift(newDoc);
    await storageAdapter.set(DOCUMENTS_KEY, allDocs);

    return newDoc;
  },

  async deleteDocument(employeeId, documentId) {
    await this.init();

    try {
      await indexedDbAdapter.deleteAttachment(documentId);
    } catch (e) {
      console.warn('IndexedDB delete error:', e);
    }

    const allDocs = await storageAdapter.get(DOCUMENTS_KEY, INITIAL_DOCUMENTS);
    if (allDocs[employeeId]) {
      allDocs[employeeId] = allDocs[employeeId].filter(d => d.id !== documentId);
      await storageAdapter.set(DOCUMENTS_KEY, allDocs);
    }

    return true;
  }
};
