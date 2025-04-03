"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import { PlaybackBar } from "./PlaybackBar";
import styles from "./PlayerPlayback.module.css";
import SpeedDropDown from "./SpeedDropDown";
import Filter from "./Filter";

// Exclude "none" from filterType used for BiquadFilterNode
const isBiquadFilterType = (type: string): type is BiquadFilterType => {
  return type === "highpass" || type === "lowpass";
};

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

  const [playbackRate, setPlaybackRate] = useState<number>(1); // Default: normal speed
  const [filterType, setFilterType] = useState<"none" | "highpass" | "lowpass">(
    "none"
  );
  const [filterFrequency, setFilterFrequency] = useState<number>(1000);

  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Whenever new audio is loaded, reset the playback state to beginning and stop any playing audio.
  useEffect(() => {
    setPlaybackState({
      state: "stopped",
      positionMilliseconds: 0,
    });
  }, [audioBuffer]);

  // Create and connect audio nodes
  const connectNodes = (source: AudioBufferSourceNode) => {
    sourceNodeRef.current = source;

    const gainNode = context.createGain();
    gainNodeRef.current = gainNode;

    if (!filterNodeRef.current && isBiquadFilterType(filterType)) {
      const filter = context.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.value = filterFrequency;
      filterNodeRef.current = filter;
    }

    if (filterNodeRef.current) {
      source.connect(filterNodeRef.current);
      filterNodeRef.current.connect(gainNode);
    } else {
      source.connect(gainNode);
    }

    gainNode.connect(context.destination);
  };

  // Effect to handle speed changes during playback
  useEffect(() => {
    if (playbackState.state === "playing" && audioBuffer) {
      const currentPosition =
        Date.now() - playbackState.effectiveStartTimeMilliseconds;

      const oldSource = playbackState.source;
      const newSource = context.createBufferSource();
      newSource.buffer = audioBuffer;
      newSource.playbackRate.value = playbackRate;

      connectNodes(newSource);

      newSource.start(0, currentPosition / 1000);

      setPlaybackState({
        state: "playing",
        effectiveStartTimeMilliseconds: Date.now() - currentPosition,
        source: newSource,
      });

      setTimeout(() => {
        oldSource.stop();
        oldSource.disconnect();
      }, 50);
    }
  }, [playbackRate]);

  // Effect to update filter settings live during playback
  useEffect(() => {
    if (filterNodeRef.current) {
      if (filterType === "none") {
        filterNodeRef.current.disconnect();
        gainNodeRef.current?.disconnect();
        sourceNodeRef.current?.connect(context.destination);
      } else if (isBiquadFilterType(filterType)) {
        filterNodeRef.current.type = filterType;
        filterNodeRef.current.frequency.setValueAtTime(
          filterFrequency,
          context.currentTime
        );
      }
    }
  }, [filterType, filterFrequency]);

  //Defines the play function using useCallback so it doesn't re-create unless dependencies change
  const play = useCallback(() => {
    if (!audioBuffer || playbackState.state === "playing") return;

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackRate;

    const effectiveStartTimeMilliseconds =
      Date.now() - playbackState.positionMilliseconds;

    connectNodes(source);

    source.start(0, playbackState.positionMilliseconds / 1000);

    setPlaybackState({
      state: "playing",
      effectiveStartTimeMilliseconds,
      source,
    });
  }, [
    context,
    audioBuffer,
    playbackState,
    playbackRate,
    filterType,
    filterFrequency,
  ]);

  //Stops playback and updates the playback position
  const stopAndGoTo = useCallback(
    (goToPositionMillis?: number) => {
      if (playbackState.state === "stopped") {
        if (goToPositionMillis !== undefined) {
          setPlaybackState({
            state: "stopped",
            positionMilliseconds: goToPositionMillis,
          });
        }
        return;
      }

      const positionMilliseconds =
        goToPositionMillis ??
        Date.now() - playbackState.effectiveStartTimeMilliseconds;

      playbackState.source.stop();
      playbackState.source.disconnect();
      filterNodeRef.current?.disconnect();
      gainNodeRef.current?.disconnect();

      setPlaybackState({
        state: "stopped",
        positionMilliseconds,
      });
    },
    [playbackState]
  );

  const pause = useCallback(() => stopAndGoTo(), [stopAndGoTo]);
  const stop = useCallback(() => stopAndGoTo(0), [stopAndGoTo]);

  if (!audioBuffer) {
    return "No Audio File Loaded";
  }

  return (
    <>
      <div className={styles.controls}>
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
          frequency={filterFrequency}
          onFrequencyChange={setFilterFrequency}
        />
      </div>
      <PlaybackBar
        state={playbackState}
        totalTimeMilliseconds={audioBuffer.duration * 1000}
      />
    </>
  );
};
