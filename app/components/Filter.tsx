"use client";

import React, { useState } from "react";
import Slider from "./Slider";

type FilterProps = {
  filterType: "none" | "highpass" | "lowpass";
  onFilterChange: (type: "none" | "highpass" | "lowpass") => void;
  onFrequencyChange?: (frequency: number) => void;
  frequency?: number;
};

export default function Filter({
  filterType,
  onFilterChange,
  frequency,
  onFrequencyChange,
}: FilterProps) {
  const [highPassValue, setHighPassValue] = useState(1000);
  const [lowPassValue, setLowPassValue] = useState(50000);

  const handleHighPassChange = (value: number) => {
    setHighPassValue(value);
    if (onFrequencyChange) {
      onFrequencyChange(value);
    }
  };

  const handleLowPassChange = (value: number) => {
    setLowPassValue(value);
    if (onFrequencyChange) {
      onFrequencyChange(value);
    }
  };

  return (
    <div>
      <button onClick={() => onFilterChange("none")}>None</button>
      <button onClick={() => onFilterChange("highpass")}>High Pass</button>
      <button onClick={() => onFilterChange("lowpass")}>Low Pass</button>

      <Slider
        label="High Pass"
        value={highPassValue}
        onChange={handleHighPassChange}
        min={20}
        max={20000}
        step={100}
        disabled={filterType !== "highpass"}
      />

      <Slider
        label="Low Pass"
        value={lowPassValue}
        onChange={handleLowPassChange}
        min={1000}
        max={50000}
        step={100}
        disabled={filterType !== "lowpass"}
      />
    </div>
  );
}
