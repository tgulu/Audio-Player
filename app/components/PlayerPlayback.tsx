"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import { PlaybackBar } from "./PlaybackBar";
import styles from "../player.module.css";
import SpeedDropDown from "./SpeedDropDown";
import Filter from "./Filter";
import {
  loadUserAudioSettings,
  saveUserAudioSettings,
} from "../storage/user-data";

type PlayerPlaybackProps = {
  context: AudioContext;
  audioBuffer: AudioBuffer | null;
};

type PlaybackState =
  | {
      state: "stopped";
      positionMilliseconds: number;
    }
  | {
      state: "playing";
      effectiveStartTimeMilliseconds: number;
      source: AudioBufferSourceNode;
    };

type AudioSettings = {
  playbackRate: number;
  filterType: "none" | "highpass" | "lowpass";
  highpassFrequency: number;
  lowpassFrequency: number;
};

export const PlayerPlayback: FC<PlayerPlaybackProps> = ({
  context,
  audioBuffer,
}) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    state: "stopped",
    positionMilliseconds: 0,
  });

  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [filterType, setFilterType] = useState<"none" | "highpass" | "lowpass">(
    "none"
  );
  const [highpassFrequency, setHighpassFrequency] = useState<number>(1000);
  const [lowpassFrequency, setLowpassFrequency] = useState<number>(1000);

  // Audio node refs
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // State to manage settings persistence
  const isInitialLoad = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousSettingsRef = useRef<AudioSettings>({
    playbackRate: 1,
    filterType: "none",
    highpassFrequency: 1000,
    lowpassFrequency: 1000,
  });

  // Load user settings on initial mount
  useEffect(() => {
    const loadSettings = async () => {
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        try {
          const settings = await loadUserAudioSettings();
          setPlaybackRate(settings.playbackRate);
          setFilterType(settings.filterType);
          setHighpassFrequency(settings.highpassFrequency);
          setLowpassFrequency(settings.lowpassFrequency);
          previousSettingsRef.current = settings;
        } catch (error) {
          console.error("Failed to load user settings:", error);
        }
      }
    };
    loadSettings();
  }, []);

  // Save user settings when they change (debounced)
  useEffect(() => {
    const currentSettings: AudioSettings = {
      playbackRate,
      filterType,
      highpassFrequency,
      lowpassFrequency,
    };

    // Check if anything has changed
    const hasChanged = Object.entries(currentSettings).some(
      ([key, value]) =>
        previousSettingsRef.current[key as keyof AudioSettings] !== value
    );

    if (!hasChanged) return;

    previousSettingsRef.current = currentSettings;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save
    saveTimeoutRef.current = setTimeout(() => {
      saveUserAudioSettings(currentSettings);
    }, 500);

    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [playbackRate, filterType, highpassFrequency, lowpassFrequency]);

  // Configure audio routing based on current settings
  const setupAudioNodes = useCallback(() => {
    if (!gainNodeRef.current) {
      gainNodeRef.current = context.createGain();
      gainNodeRef.current.connect(context.destination);
    }

    // Create and configure filter node if needed
    if (filterType !== "none") {
      if (!filterNodeRef.current) {
        filterNodeRef.current = context.createBiquadFilter();
      }
      filterNodeRef.current.type = filterType;
      filterNodeRef.current.frequency.value =
        filterType === "highpass" ? highpassFrequency : lowpassFrequency;
    }

    // Connect source -> filter (if used) -> gain -> destination
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      if (filterType !== "none" && filterNodeRef.current) {
        sourceNodeRef.current.connect(filterNodeRef.current);
        filterNodeRef.current.connect(gainNodeRef.current!);
      } else {
        sourceNodeRef.current.connect(gainNodeRef.current!);
      }
    }
  }, [context, filterType, highpassFrequency, lowpassFrequency]);

  // Re-setup nodes when filter settings change
  useEffect(() => {
    if (playbackState.state === "playing") {
      setupAudioNodes();
    }
  }, [filterType, highpassFrequency, lowpassFrequency, setupAudioNodes]);

  // Update playback rate in real-time
  useEffect(() => {
    if (playbackState.state === "playing") {
      playbackState.source.playbackRate.value = playbackRate;
    }
  }, [playbackRate, playbackState.state]);

  // Start playback
  const play = useCallback(() => {
    if (!audioBuffer || playbackState.state === "playing") return;

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackRate;
    sourceNodeRef.current = source;

    setupAudioNodes();

    const startTime = context.currentTime;
    const positionSeconds =
      playbackState.state === "stopped"
        ? playbackState.positionMilliseconds / 1000
        : 0;

    source.start(startTime, positionSeconds);

    setPlaybackState({
      state: "playing",
      effectiveStartTimeMilliseconds:
        Date.now() -
        (playbackState.state === "stopped"
          ? playbackState.positionMilliseconds
          : 0),
      source,
    });
  }, [audioBuffer, context, playbackRate, playbackState, setupAudioNodes]);

  // Pause playback and remember current position
  const pause = useCallback(() => {
    if (playbackState.state !== "playing") return;

    const currentPositionMilliseconds =
      Date.now() - playbackState.effectiveStartTimeMilliseconds;

    playbackState.source.stop();
    sourceNodeRef.current = null;

    setPlaybackState({
      state: "stopped",
      positionMilliseconds: currentPositionMilliseconds,
    });
  }, [playbackState]);

  // Stop playback and reset position
  const stop = useCallback(() => {
    if (playbackState.state === "playing") {
      playbackState.source.stop();
      sourceNodeRef.current = null;
    }

    setPlaybackState({
      state: "stopped",
      positionMilliseconds: 0,
    });
  }, [playbackState]);

  return (
    <>
      <div className={styles.playerControls}>
        {/* Play/Pause and Stop controls */}
        {playbackState.state === "playing" ? (
          <button
            onClick={pause}
            className={`${styles.controlButton} ${styles.controlButtonPrimary}`}
          >
            ⏸ Pause
          </button>
        ) : (
          <button
            onClick={play}
            className={`${styles.controlButton} ${styles.controlButtonPrimary}`}
          >
            ▶ Play
          </button>
        )}
        <button
          onClick={stop}
          className={`${styles.controlButton} ${styles.controlButtonSecondary}`}
        >
          ⏹ Stop
        </button>

        {/* Speed and filter controls */}
        <SpeedDropDown
          playbackRate={playbackRate}
          onSpeedChange={setPlaybackRate}
        />
        <Filter
          filterType={filterType}
          onFilterChange={setFilterType}
          frequency={
            filterType === "highpass" ? highpassFrequency : lowpassFrequency
          }
          onFrequencyChange={
            filterType === "highpass"
              ? setHighpassFrequency
              : setLowpassFrequency
          }
        />
      </div>

      {/* Display playback progress if a file is loaded */}
      {audioBuffer && (
        <div className={styles.playbackBar}>
          <PlaybackBar
            state={playbackState}
            totalTimeMilliseconds={audioBuffer.duration * 1000}
          />
        </div>
      )}
    </>
  );
};
