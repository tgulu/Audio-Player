import React from "react";
import styles from "../player.module.css";

type SpeedDropDownProps = {
  playbackRate: number;
  onSpeedChange: (speed: number) => void;
};

// Preset speed options for playback rate selection
const SPEED_OPTIONS = [
  { value: 0.5, label: "0.5x" },
  { value: 1, label: "1x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
];

// Dropdown for selecting playback speed
export default function SpeedDropDown({
  playbackRate = 1,
  onSpeedChange,
}: SpeedDropDownProps) {
  return (
    <div className={styles.speedDropdown}>
      <p className={styles.speedLabel}>Speed</p>
      <select
        className={styles.speedSelect}
        value={playbackRate}
        onChange={(e) => onSpeedChange(Number(e.target.value))}
      >
        {SPEED_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
