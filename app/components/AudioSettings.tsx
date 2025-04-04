// app/components/AudioSettings.tsx
"use client";

import { FC } from "react";
import SpeedDropDown from "./SpeedDropDown";
import Filter from "./Filter";

type AudioSettingsProps = {
  playbackRate: number;
  filterType: "none" | "highpass" | "lowpass";
  highpassFrequency: number;
  lowpassFrequency: number;
  onPlaybackRateChange: (rate: number) => void;
  onFilterTypeChange: (type: "none" | "highpass" | "lowpass") => void;
  onHighpassFrequencyChange: (frequency: number) => void;
  onLowpassFrequencyChange: (frequency: number) => void;
};

const AudioSettings: FC<AudioSettingsProps> = ({
  playbackRate,
  filterType,
  highpassFrequency,
  lowpassFrequency,
  onPlaybackRateChange,
  onFilterTypeChange,
  onHighpassFrequencyChange,
  onLowpassFrequencyChange,
}) => {
  return (
    <div>
      <SpeedDropDown
        playbackRate={playbackRate}
        onSpeedChange={onPlaybackRateChange}
      />
      <Filter
        filterType={filterType}
        onFilterChange={onFilterTypeChange}
        frequency={
          filterType === "highpass" ? highpassFrequency : lowpassFrequency
        }
        onFrequencyChange={
          filterType === "highpass"
            ? onHighpassFrequencyChange
            : onLowpassFrequencyChange
        }
      />
    </div>
  );
};

export default AudioSettings;
