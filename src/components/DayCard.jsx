import React from 'react';
import { THAI_DAYS, DAY_HEADER_COLORS } from '../utils/constants';
import { calculateDailyDose } from '../utils/pillCalculator';
import Pill from './Pill';

export default function DayCard({ dayIndex, pills, onAddPill, onRemovePill }) {
    const dayName = THAI_DAYS[dayIndex];
    const headerColor = DAY_HEADER_COLORS[dayIndex];
    const dailyDose = calculateDailyDose(pills);
    const isDayOff = pills.length === 0;

    return (
        <div className="day-card border-2 border-gray-200 rounded-xl overflow-hidden flex flex-col">
            <div className={`font-bold text-center py-3 text-lg ${headerColor} text-white`}>
                {dayName}
            </div>
            <div className="p-2 text-center bg-white flex-grow flex flex-col" style={{ minHeight: '120px' }}>
                <div className="text-sm text-gray-800 font-bold mb-2 h-6">
                    {dailyDose > 0 ? `${dailyDose.toFixed(2)} mg` : ''}
                </div>

                {isDayOff ? (
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-4xl mb-2">🚫</div>
                            <div className="text-red-600 font-bold text-sm">หยุดยา</div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-wrap items-center content-start justify-center gap-1 py-1 overflow-y-auto">
                        {pills.map((pill, index) => (
                            <Pill
                                key={index}
                                mg={pill.mg}
                                half={pill.half}
                                quarter={pill.quarter}
                                onClick={() => onRemovePill(dayIndex, index)}
                            />
                        ))}
                    </div>
                )}
            </div>
            <button
                onClick={() => onAddPill(dayIndex)}
                className="add-pill-btn bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2 w-full text-2xl"
            >
                +
            </button>
        </div>
    );
}
