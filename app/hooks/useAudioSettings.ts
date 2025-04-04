// app/hooks/useAudioSettings.ts
import { useEffect, useState } from "react";
import {
  loadUserAudioSettings,
  saveUserAudioSettings,
} from "../storage/user-data";

type AudioSettings = {
  playbackRate: number;
  filterType: "none" | "highpass" | "lowpass";
  highpassFrequency: number;
  lowpassFrequency: number;
};

const defaultSettings: AudioSettings = {
  playbackRate: 1,
  filterType: "none",
  highpassFrequency: 1000,
  lowpassFrequency: 1000,
};

export const useAudioSettings = () => {
  const [settings, setSettings] = useState<AudioSettings>(defaultSettings);

  // Load user settings on initial render
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await loadUserAudioSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.error("Failed to load user settings:", error);
      }
    };
    loadSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    saveUserAudioSettings(settings);
  }, [settings]);

  return [settings, setSettings] as const;
};
