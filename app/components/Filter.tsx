"use client";

import React, { useState } from "react";

type FilterProps = {
    state: "high-pass" | "low-pass";
    onHighPassChange: (highPass: number) => void;
    onLowPassChange: (lowPass: number) => void;
};

export default function Filter({ state, onHighPassChange, onLowPassChange }: FilterProps) {
    const [highPassValue, setHighPassValue] = useState(1000);
        const [lowPassValue, setLowPassValue] = useState(50000);
        
    return (
        
        <div>
            <button>High Pass</button>
            <button>Low Pass</button>
        </div>
    )
}