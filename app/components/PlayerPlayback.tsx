// app/components/PlayerPlayback.tsx
"use client";

import { FC, useCallback, useRef, useState } from "react";
import PlaybackControls from "./PlaybackControls";
import AudioSettings from "./AudioSettings";
import { PlaybackBar } from "./PlaybackBar";
import styles from "./PlayerPlayback.module.css";
import { useAudioSettings } from "../hooks/useAudioSettings";

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
  const [settings, setSettings] = useAudioSettings();
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    state: "stopped",
    positionMilliseconds: 0,
  });

  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const play = useCallback(() => {
    if (!audioBuffer || playbackState.state === "playing") return;

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = settings.playbackRate;
    sourceNodeRef.current = source;

    const startTime = context.currentTime;
    source.start(startTime);

    setPlaybackState({
      state: "playing",
      effectiveStartTimeMilliseconds: Date.now(),
      source,
    });
  }, [audioBuffer, context, playbackState, settings]);

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
              playbackRate={settings.playbackRate}
              filterType={settings.filterType}
              highpassFrequency={settings.highpassFrequency}
              lowpassFrequency={settings.lowpassFrequency}
              onPlaybackRateChange={(rate) =>
                setSettings({ ...settings, playbackRate: rate })
              }
              onFilterTypeChange={(type) =>
                setSettings({ ...settings, filterType: type })
              }
              onHighpassFrequencyChange={(frequency) =>
                setSettings({ ...settings, highpassFrequency: frequency })
              }
              onLowpassFrequencyChange={(frequency) =>
                setSettings({ ...settings, lowpassFrequency: frequency })
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
