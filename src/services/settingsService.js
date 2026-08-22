import { storageAdapter } from './storage/storageAdapter';
import { INITIAL_SETTINGS } from '../data/mockData';

const SETTINGS_KEY = 'admin_system_settings';

export const settingsService = {
  async getSettings() {
    let settings = await storageAdapter.get(SETTINGS_KEY);
    if (!settings) {
      settings = INITIAL_SETTINGS;
      await storageAdapter.set(SETTINGS_KEY, settings);
    }
    return settings;
  },

  async updateSettings(updatedSection, sectionKey) {
    await new Promise(r => setTimeout(r, 200));
    const current = await this.getSettings();

    const updated = {
      ...current,
      [sectionKey]: {
        ...current[sectionKey],
        ...updatedSection
      }
    };

    await storageAdapter.set(SETTINGS_KEY, updated);
    return updated;
  },

  async saveAllSettings(newSettings) {
    await new Promise(r => setTimeout(r, 250));
    await storageAdapter.set(SETTINGS_KEY, newSettings);
    return newSettings;
  }
};
