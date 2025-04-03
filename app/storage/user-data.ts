// This file contains only client-side code
import { z } from "zod";

/**
 * This object defines the type for the data we store for each user.
 *
 * We use `zod` so that we can validate the data we get from the file system,
 * and avoid causing type-errors.
 */
export const USER_DATA = z.object({
  /**
   * Track the date that the user first loaded the app.
   *
   * This is just used as an example for how we store data
   */
  firstPageLoad: z.string().nullable(),

  /**
   * User's audio playback settings
   */
  audioPlaybackSettings: z.object({
    playbackRate: z.number().default(1),
    filterType: z.enum(["none", "highpass", "lowpass"]).default("none"),
    highpassFrequency: z.number().default(1000),
    lowpassFrequency: z.number().default(1000),
  }),
});

export type UserData = z.infer<typeof USER_DATA>;

export const DEFAULT_DATA: UserData = {
  firstPageLoad: null,
  audioPlaybackSettings: {
    playbackRate: 1,
    filterType: "none",
    highpassFrequency: 1000,
    lowpassFrequency: 1000,
  },
};

// Client-side functions that use fetch
export const loadUserAudioSettings = async () => {
  console.log("Attempting to load user settings...");
  try {
    const res = await fetch("/api/user-data", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("Loaded user settings:", data);
    return data.audioPlaybackSettings ?? DEFAULT_DATA.audioPlaybackSettings;
  } catch (err) {
    console.error("Error loading settings:", err);
    return DEFAULT_DATA.audioPlaybackSettings;
  }
};

export const saveUserAudioSettings = async (settings: {
  playbackRate: number;
  filterType: "none" | "highpass" | "lowpass";
  highpassFrequency: number;
  lowpassFrequency: number;
}) => {
  console.log("Attempting to save user settings:", settings);
  try {
    const response = await fetch("/api/user-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        audioPlaybackSettings: settings,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Successfully saved settings:", data);
    return data;
  } catch (err) {
    console.error("Error saving settings:", err);
    throw err;
  }
};
