"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import { PlaybackBar } from "./PlaybackBar";
import styles from "./PlayerPlayback.module.css";
import SpeedDropDown from "./SpeedDropDown";
import Link from "next/link";
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
  ``;
  const [filterType, setFilterType] = useState<"none" | "highpass" | "lowpass">(
    "none"
  );
  const [highpassFrequency, setHighpassFrequency] = useState<number>(1000);
  const [lowpassFrequency, setLowpassFrequency] = useState<number>(1000);

  // Refs for audio nodes
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Settings management refs
  const isInitialLoad = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousSettingsRef = useRef<AudioSettings>({
    playbackRate: 1,
    filterType: "none",
    highpassFrequency: 1000,
    lowpassFrequency: 1000,
  });

  // Load user settings on initial render
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

  // Save settings when they change
  useEffect(() => {
    const currentSettings: AudioSettings = {
      playbackRate,
      filterType,
      highpassFrequency,
      lowpassFrequency,
    };

    const hasChanged = Object.entries(currentSettings).some(
      ([key, value]) =>
        previousSettingsRef.current[key as keyof AudioSettings] !== value
    );

    if (!hasChanged) return;

    previousSettingsRef.current = currentSettings;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      saveUserAudioSettings(currentSettings);
    }, 500);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [playbackRate, filterType, highpassFrequency, lowpassFrequency]);

  // Initialize or update audio nodes
  const setupAudioNodes = useCallback(() => {
    // Create gain node if it doesn't exist
    if (!gainNodeRef.current) {
      gainNodeRef.current = context.createGain();
      gainNodeRef.current.connect(context.destination);
    }

    // Create or update filter node
    if (filterType !== "none") {
      if (!filterNodeRef.current) {
        filterNodeRef.current = context.createBiquadFilter();
      }
      filterNodeRef.current.type = filterType;
      filterNodeRef.current.frequency.value =
        filterType === "highpass" ? highpassFrequency : lowpassFrequency;
    }

    // Connect nodes based on filter type
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

  // Effect for handling filter changes
  useEffect(() => {
    if (playbackState.state === "playing") {
      setupAudioNodes();
    }
  }, [filterType, highpassFrequency, lowpassFrequency, setupAudioNodes]);

  // Handle playback rate changes
  useEffect(() => {
    if (playbackState.state === "playing") {
      playbackState.source.playbackRate.value = playbackRate;
    }
  }, [playbackRate, playbackState]);

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
      <div className={styles.controls}>
        {!audioBuffer ? (
          <div>
            <Link href="/">Back to Home</Link>
            <h3>No Audio File Loaded</h3>
          </div>
        ) : (
          <>
            {playbackState.state === "playing" ? (
              <button onClick={pause}>Pause</button>
            ) : (
              <button onClick={play}>Play</button>
            )}
            <button onClick={stop}>Stop</button>
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
          </>
        )}
      </div>

      {audioBuffer && (
        <PlaybackBar
          state={playbackState}
          totalTimeMilliseconds={audioBuffer.duration * 1000}
        />
      )}
    </>
  );
};
