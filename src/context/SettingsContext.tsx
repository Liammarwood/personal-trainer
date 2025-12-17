import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppSettings, SettingsContextType } from '../types';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('workout-settings');
    return saved ? JSON.parse(saved) : {
      showStatsOverlay: true,
      showRepQuality: false,
      soundEnabled: false,
      showAdvancedMode: false,
      clientSideProcessing: true, // Enable by default for better performance
    };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('workout-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key: keyof AppSettings, value: boolean): void => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};
