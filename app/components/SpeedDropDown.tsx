import React from "react"


type SpeedDropDownProps = {
    playbackRate: number;
    onSpeedChange: (speed: number) => void;
};

const SPEED_OPTIONS = [
    { value: 1, label: "1x" },
    { value: 2, label: "2x" },
];

export default function SpeedDropDown({ playbackRate, onSpeedChange }: SpeedDropDownProps) {
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