/**
 * LocalStorage Adapter Implementation
 * Implements the core Storage Adapter interface for client-side persistence.
 */
class LocalStorageAdapter {
  constructor(prefix = 'vantage_hrms_') {
    this.prefix = prefix;
  }

  _getKey(key) {
    return `${this.prefix}${key}`;
  }

  async get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this._getKey(key));
      if (item === null || item === undefined) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (err) {
      console.error(`[StorageAdapter] Error reading key "${key}":`, err);
      return defaultValue;
    }
  }

  async set(key, value) {
    try {
      localStorage.setItem(this._getKey(key), JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`[StorageAdapter] Error writing key "${key}":`, err);
      return false;
    }
  }

  async remove(key) {
    try {
      localStorage.removeItem(this._getKey(key));
      return true;
    } catch (err) {
      console.error(`[StorageAdapter] Error removing key "${key}":`, err);
      return false;
    }
  }

  async clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.prefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      return true;
    } catch (err) {
      console.error(`[StorageAdapter] Error clearing keys:`, err);
      return false;
    }
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
