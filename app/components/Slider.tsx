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
  return <div></div>;
}
