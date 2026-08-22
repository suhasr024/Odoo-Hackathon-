import React, { createContext, useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/settingsService';
import { useToast } from '../hooks/useToast';

export const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const { success, error: toastError } = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error('[SettingsContext] Error fetching settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSection = async (sectionData, sectionKey) => {
    try {
      const updated = await settingsService.updateSettings(sectionData, sectionKey);
      setSettings(updated);
      success('Settings updated successfully.');
      return updated;
    } catch (err) {
      toastError(err.message);
      throw err;
    }
  };

  const saveAll = async (newSettings) => {
    try {
      const updated = await settingsService.saveAllSettings(newSettings);
      setSettings(updated);
      success('All system settings saved.');
      return updated;
    } catch (err) {
      toastError(err.message);
      throw err;
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      error,
      updateSection,
      saveAll,
      refreshSettings: fetchSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
