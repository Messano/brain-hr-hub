import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'notification_preferences';

interface NotificationPreferences {
  soundEnabled: boolean;
}

const defaultPreferences: NotificationPreferences = {
  soundEnabled: true,
};

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultPreferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error reading notification preferences:', error);
    }
    return defaultPreferences;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }, [preferences]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setPreferences(prev => ({ ...prev, soundEnabled: enabled }));
  }, []);

  return {
    soundEnabled: preferences.soundEnabled,
    setSoundEnabled,
  };
}
