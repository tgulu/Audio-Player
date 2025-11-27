"use client";

import React from "react";
import styles from "../player.module.css";

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  disabled?: boolean;
};

// Reusable slider component for controlling frequency or other numeric values
export default function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  disabled = false,
}: SliderProps) {
  return (
    <div className={styles.sliderContainer}>
      <p className={styles.sliderLabel}>
        {label}: {value} Hz
      </p>
      <input
        id={`slider-${label}`}
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
      />
    </div>
  );
}
