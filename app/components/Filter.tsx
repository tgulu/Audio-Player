"use client";

import React, { useState, useEffect } from "react";
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
  const [highPassValue, setHighPassValue] = useState(frequency || 1000);
  const [lowPassValue, setLowPassValue] = useState(frequency || 1000);

  // Update local state when frequency prop changes
  useEffect(() => {
    if (frequency) {
      if (filterType === "highpass") {
        setHighPassValue(frequency);
      } else if (filterType === "lowpass") {
        setLowPassValue(frequency);
      }
    }
  }, [frequency, filterType]);

  const handleHighPassChange = (value: number) => {
    setHighPassValue(value);
    onFrequencyChange?.(value);
  };

  const handleLowPassChange = (value: number) => {
    setLowPassValue(value);
    onFrequencyChange?.(value);
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
        min={100}
        max={10000}
        step={100}
        disabled={filterType !== "highpass"}
      />

      <Slider
        label="Low Pass"
        value={lowPassValue}
        onChange={handleLowPassChange}
        min={500}
        max={20000}
        step={100}
        disabled={filterType !== "lowpass"}
      />
    </div>
  );
}
