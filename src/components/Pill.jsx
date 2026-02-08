import React from 'react';

export default function Pill({ mg, half = false, quarter = false, onClick, className = '' }) {
    const fractionClass = quarter ? 'pill-quarter-left' : (half ? 'pill-half-left' : '');

    return (
        <span
            className={`pill pill-${mg}mg ${fractionClass} ${onClick ? 'cursor-pointer hover:opacity-75' : ''} ${className}`}
            title={onClick ? 'คลิกเพื่อลบ' : ''}
            onClick={onClick}
        />
    );
}

export function PillVisual({ combo }) {
    if (!combo || combo.length === 0) return null;

    return (
        <>
            {combo.map((p, idx) => (
                Array(p.count).fill(null).map((_, i) => (
                    <Pill key={`${idx}-${i}`} mg={p.mg} half={p.half} quarter={p.quarter} />
                ))
            ))}
        </>
    );
}
