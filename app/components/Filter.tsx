"use client";

import React, { useState } from "react";

type FilterProps = {
    filterType: "none" | "highpass" | "lowpass";
    onFilterChange: (type: "none" | "highpass" | "lowpass") => void;
};

export default function Filter({ filterType,onFilterChange  }: FilterProps) {
    const [highPassValue, setHighPassValue] = useState(1000);
        const [lowPassValue, setLowPassValue] = useState(50000);

    return (
        
        <div>
            <button onClick={() => onFilterChange('none')}>High Pass</button>
            <button onClick={() => onFilterChange('highpass')}>Low Pass</button>
        </div>
    )   
}