// app/components/PlaybackControls.tsx
"use client";

import { FC } from "react";

type PlaybackControlsProps = {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
};

const PlaybackControls: FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onStop,
}) => {
  return (
    <div>
      {isPlaying ? (
        <button onClick={onPause}>Pause</button>
      ) : (
        <button onClick={onPlay}>Play</button>
      )}
      <button onClick={onStop}>Stop</button>
    </div>
  );
};

export default PlaybackControls;
