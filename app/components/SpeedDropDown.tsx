import React from "react"


type SpeedDropDownProps = {
    playbackRate: number;
    onSpeedChange: (speed: number) => void;
};

const SPEED_OPTIONS = [
    { value: 0.5, label: "0.5x" },
    { value: 1, label: "1x" },
    { value: 2, label: "2x" },
];

export default function SpeedDropDown({ playbackRate = 1, onSpeedChange }: SpeedDropDownProps) {
    return (
        <div>
            <select value={playbackRate} onChange={(e) => onSpeedChange(Number(e.target.value))}>
                {SPEED_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>

    )
}