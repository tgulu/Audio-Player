"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import { PlaybackBar } from "./PlaybackBar";
import styles from "./PlayerPlayback.module.css";
import SpeedDropDown from "./SpeedDropDown";
import Filter from "./Filter";

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
  const [filterFrequency, setFilterFrequency] = useState<number>(1000);

  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Whenever new audio is loaded, reset the playback state to beginning and stop any playing audio.
  useEffect(() => {
    setPlaybackState({
      state: "stopped",
      positionMilliseconds: 0,
    });
  }, [audioBuffer]);

  //Create a filter using Web Audio API. If a filter is selected, set its type and frequency.
  const connectNodes = (source: AudioBufferSourceNode) => {
    if (filterType !== "none") {
      const filter = context.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.value = filterFrequency;
      filterNodeRef.current = filter;
      source.connect(filter);
      filter.connect(context.destination);
    } else {
      filterNodeRef.current = null;
      source.connect(context.destination);
    }
  };

  // Add effect to handle speed changes during playback
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
