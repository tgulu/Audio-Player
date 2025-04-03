"use client";

import { FC, useCallback, useEffect, useState } from "react";
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

  const [playbackRate, setPlaybackRate] = useState<number>(1); // Default: normal speed

  const [filterType, setFilterType] = useState<"none" | "highpass" | "lowpass">("none");
  const [filterFrequency, setFilterFrequency] = useState<number>(1000);


      // Whenever new audio is loaded, reset the playback state to beginning and stop any playing audio.
  useEffect(() => {
    setPlaybackState({
      state: "stopped",
      positionMilliseconds: 0,
    });
  }, [audioBuffer]);

    // Add effect to handle speed changes during playback
  useEffect(() => {
    if (playbackState.state === "playing") {
const currentPosition = Date.now() - playbackState.effectiveStartTimeMilliseconds;

playbackState.source.stop()
  }


//Defines the play function using useCallback so it doesn't re-create unless dependencies change
  const play = useCallback(() => {
    if (!audioBuffer) {
      return;
    }

    if (playbackState.state === "playing") {
      // Already playing
      return;
    }


//Create a filter using Web Audio API. If a filter is selected, set its type and frequency.
    const filter = context.createBiquadFilter();
    if (filterType !== "none") {
      filter.type = filterType;
      filter.frequency.value = filterFrequency;
    }

    const source = context.createBufferSource();

    source.buffer = audioBuffer;
    source.playbackRate.value = playbackRate;

    const effectiveStartTimeMilliseconds =
      Date.now() - playbackState.positionMilliseconds;

    source.connect(context.destination);
    source.start(0, playbackState.positionMilliseconds / 1000);


    setPlaybackState({
      state: "playing",
      effectiveStartTimeMilliseconds,
      source,
    });
  }, [context, audioBuffer, playbackState, playbackRate, filterType, filterFrequency]);

  const stopAndGoTo = useCallback(
    (goToPositionMillis?: number) => {
      if (playbackState.state === "stopped") {
        // Already paused, just seek to new position
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

      setPlaybackState({
        state: "stopped",
        positionMilliseconds,
      });
    },
    [playbackState],
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
        />
        
      </div>

      <PlaybackBar
        state={playbackState}
        totalTimeMilliseconds={audioBuffer.duration * 1000}
      />
    </>
  );
};
