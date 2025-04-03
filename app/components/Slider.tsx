"use client";

import React from "react";

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  disabled?: boolean;
};

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
    <div>
      <label htmlFor={`slider-${label}`}>
        {label}: {value}Hz
      </label>
      <input
        className=" gap: 1em"
        id={`slider-${label}`}
        type="range"
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
