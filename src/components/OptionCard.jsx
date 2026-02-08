import React from 'react';
import { THAI_DAYS, DAY_HEADER_COLORS, FLOAT_TOLERANCE } from '../utils/constants';
import { PillVisual } from './Pill';
import MedicationInstructions from './MedicationInstructions';

export default function OptionCard({
    option,
    optionNumber,
    index,
    isSelected,
    onSelect,
    dayOrder,
    dateConfig
}) {
    const startDay = dayOrder === 'sunday' ? 0 : 1;
    const totalWeekly = option.dailyDoses.reduce((a, b) => a + b, 0);

    return (
        <div
            id={`option-card-${index}`}
            className={`option-card section-card rounded-lg shadow-md p-6 mb-6 ${isSelected ? 'selected' : ''}`}
            onClick={onSelect}
            data-total-dose={totalWeekly.toFixed(1)}
        >
            {/* Checkbox */}
            <div className={`option-checkbox ${isSelected ? 'checked' : ''}`}>
                {isSelected && <span className="checkmark">✓</span>}
            </div>

            <h4 className="text-xl font-semibold mb-4 text-gray-800 pr-12">
                ตัวเลือกที่ {optionNumber}
            </h4>

            {/* Day Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-6">
                {Array.from({ length: 7 }).map((_, i) => {
                    const dayIndex = (startDay + i) % 7;
                    const dose = option.dailyDoses[dayIndex];
                    const combo = option.combos[dayIndex];
                    const dayName = THAI_DAYS[dayIndex];
                    const isDayOff = dose < FLOAT_TOLERANCE;
                    const headerColor = DAY_HEADER_COLORS[dayIndex];

                    return (
                        <div
                            key={dayIndex}
                            className={`border-2 ${isDayOff ? 'border-red-300' : 'border-gray-200'} rounded-xl day-card overflow-hidden`}
                        >
                            <div className={`font-bold text-center py-3 text-lg ${headerColor} text-white`}>
                                {dayName}
                            </div>
                            <div className={`${isDayOff ? 'bg-gray-50' : 'bg-white'} p-4 text-center min-h-[100px] flex flex-col justify-center`}>
                                <div className="text-sm text-gray-700 font-medium mb-3">
                                    {!isDayOff && `${dose.toFixed(2)} mg`}
                                </div>
                                {isDayOff ? (
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🚫</div>
                                        <div className="text-red-600 font-bold text-sm">หยุดยา</div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <PillVisual combo={combo} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Medication Instructions */}
            <div className="border-t pt-4">
                <MedicationInstructions option={option} dateConfig={dateConfig} />
            </div>
        </div>
    );
}
