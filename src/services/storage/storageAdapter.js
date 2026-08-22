/**
 * Storage Adapter Facade
 * Decouples services from the concrete storage backend.
 * Easily swappable with apiAdapter or remote cloud sync.
 */
import { localStorageAdapter } from './localStorageAdapter';

class StorageAdapter {
  constructor(adapter = localStorageAdapter) {
    this.adapter = adapter;
  }

  setAdapter(newAdapter) {
    this.adapter = newAdapter;
  }

  async get(key, defaultValue = null) {
    return this.adapter.get(key, defaultValue);
  }

  async set(key, value) {
    return this.adapter.set(key, value);
  }

  async remove(key) {
    return this.adapter.remove(key);
  }

  async clear() {
    return this.adapter.clear();
  }
}

export const storageAdapter = new StorageAdapter();
