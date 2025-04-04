// app/components/PlayerPlayback.tsx
"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import PlaybackControls from "./PlaybackControls";
import AudioSettings from "./AudioSettings";
import { PlaybackBar } from "./PlaybackBar";
import styles from "./PlayerPlayback.module.css";
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

  // Refs for audio nodes
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Load user settings on initial render
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await loadUserAudioSettings();
        setPlaybackRate(settings.playbackRate);
        setFilterType(settings.filterType);
        setHighpassFrequency(settings.highpassFrequency);
        setLowpassFrequency(settings.lowpassFrequency);
      } catch (error) {
        console.error("Failed to load user settings:", error);
      }
    };
    loadSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    const currentSettings = {
      playbackRate,
      filterType,
      highpassFrequency,
      lowpassFrequency,
    };
    saveUserAudioSettings(currentSettings);
  }, [playbackRate, filterType, highpassFrequency, lowpassFrequency]);

  const play = useCallback(() => {
    if (!audioBuffer || playbackState.state === "playing") return;

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackRate;
    sourceNodeRef.current = source;

    const startTime = context.currentTime;
    source.start(startTime);

    setPlaybackState({
      state: "playing",
      effectiveStartTimeMilliseconds: Date.now(),
      source,
    });
  }, [audioBuffer, context, playbackRate, playbackState]);

  const pause = useCallback(() => {
    if (playbackState.state !== "playing") return;
    playbackState.source.stop();
    sourceNodeRef.current = null;
    setPlaybackState({
      state: "stopped",
      positionMilliseconds:
        Date.now() - playbackState.effectiveStartTimeMilliseconds,
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
          <div>No Audio File Loaded</div>
        ) : (
          <>
            <PlaybackControls
              isPlaying={playbackState.state === "playing"}
              onPlay={play}
              onPause={pause}
              onStop={stop}
            />
            <AudioSettings
              playbackRate={playbackRate}
              filterType={filterType}
              highpassFrequency={highpassFrequency}
              lowpassFrequency={lowpassFrequency}
              onPlaybackRateChange={setPlaybackRate}
              onFilterTypeChange={setFilterType}
              onHighpassFrequencyChange={setHighpassFrequency}
              onLowpassFrequencyChange={setLowpassFrequency}
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
