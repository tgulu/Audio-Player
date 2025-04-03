"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { PlaybackBar } from "./PlaybackBar";
import styles from "./PlayerPlayback.module.css";
import SpeedDropDown from "./SpeedDropDown";
// import Filter from "./Filter";

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

  // Comment out filter state
  // const [filterType, setFilterType] = useState<"none" | "highpass" | "lowpass">("none");
  // const [filterFrequency, setFilterFrequency] = useState<number>(1000);

  // Whenever new audio is loaded, reset the playback state to beginning and stop any playing audio.
  useEffect(() => {
    setPlaybackState({
      state: "stopped",
      positionMilliseconds: 0,
    });
  }, [audioBuffer]);

  // Effect to handle speed changes during playback
  useEffect(() => {
    // Only proceed if we're playing and have a valid source
    if (playbackState.state === "playing" && playbackState.source) {
      // Calculate the current position in the audio
      const currentPosition =
        Date.now() - playbackState.effectiveStartTimeMilliseconds;

      // Store the current source for cleanup
      const currentSource = playbackState.source;

      // Create a new source with the updated speed
      const newSource = context.createBufferSource();
      newSource.buffer = audioBuffer;
      newSource.playbackRate.value = playbackRate;

      // Connect the new source to the destination
      newSource.connect(context.destination);

      // Start the new source from the current position
      newSource.start(0, currentPosition / 1000);

      // Update the playback state with the new source
      setPlaybackState({
        state: "playing",
        effectiveStartTimeMilliseconds: Date.now() - currentPosition,
        source: newSource,
      });

      // Schedule the old source to stop after a small buffer time
      // This ensures a smooth transition between speeds
      setTimeout(() => {
        currentSource.stop();
        currentSource.disconnect();
      }, 50);
    }
  }, [playbackRate, context, audioBuffer]);

  //Defines the play function using useCallback so it doesn't re-create unless dependencies change
  const play = useCallback(() => {
    if (!audioBuffer) {
      return;
    }

    if (playbackState.state === "playing") {
      // Already playing
      return;
    }

    // Comment out filter code
    // // Create a filter using Web Audio API. If a filter is selected, set its type and frequency.
    // const filter = context.createBiquadFilter();
    // if (filterType !== "none") {
    //   filter.type = filterType;
    //   filter.frequency.value = filterFrequency;
    // }

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackRate;

    const effectiveStartTimeMilliseconds =
      Date.now() - playbackState.positionMilliseconds;

    // Comment out filter connection
    // // Connect the audio nodes properly
    // if (filterType !== "none") {
    //   source.connect(filter);
    //   filter.connect(context.destination);
    // } else {
    //   source.connect(context.destination);
    // }

    // Simplified connection without filter
    source.connect(context.destination);
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
    // Remove filter dependencies
    // filterType,
    // filterFrequency,
  ]);

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

      // Stop the source and disconnect it
      playbackState.source.stop();
      playbackState.source.disconnect();

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
        {/* Comment out Filter component */}
        {/* <Filter filterType={filterType} onFilterChange={setFilterType} /> */}
      </div>

      <PlaybackBar
        state={playbackState}
        totalTimeMilliseconds={audioBuffer.duration * 1000}
      />
    </>
  );
};
