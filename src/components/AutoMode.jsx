import React, { useState, useMemo } from 'react';
import { roundToHalf, OPTIONS_PER_PAGE } from '../utils/constants';
import { generateOptions } from '../utils/pillCalculator';
import OptionCard from './OptionCard';

export default function AutoMode({
    pillSettings,
    allowHalf,
    allowQuarter,
    specialPattern,
    dayOrder,
    dateConfig,
    selectedOption,
    onSelectOption,
    onPrint
}) {
    const [previousDose, setPreviousDose] = useState('');
    const [newDose, setNewDose] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [displayedCount, setDisplayedCount] = useState(OPTIONS_PER_PAGE);

    // Get available pills
    const availablePills = useMemo(() => {
        return [5, 4, 3, 2, 1].filter(mg => pillSettings[mg]);
    }, [pillSettings]);

    // Generate options
    const allOptions = useMemo(() => {
        if (!showResults || !newDose || parseFloat(newDose) <= 0) return [];
        return generateOptions(
            parseFloat(newDose),
            allowHalf,
            allowQuarter,
            specialPattern,
            availablePills
        );
    }, [showResults, newDose, allowHalf, allowQuarter, specialPattern, availablePills]);

    const displayedOptions = allOptions.slice(0, displayedCount);

    const handleCalculate = () => {
        const dose = parseFloat(newDose);
        if (!dose || dose <= 0) {
            return;
        }
        setShowResults(true);
        setDisplayedCount(OPTIONS_PER_PAGE);
        onSelectOption(-1);
    };

    const handleClear = () => {
        setPreviousDose('');
        setNewDose('');
        setShowResults(false);
        onSelectOption(-1);
    };

    const handleLoadMore = () => {
        setDisplayedCount(prev => prev + OPTIONS_PER_PAGE);
    };

    const adjustDose = (percentage) => {
        const prev = parseFloat(previousDose) || 0;
        if (prev === 0) return;
        const newValue = prev * (1 + percentage / 100);
        setNewDose(String(roundToHalf(newValue)));
        setShowResults(false);
        onSelectOption(-1);
    };

    const handleSelectOption = (index) => {
        if (selectedOption === index) {
            onSelectOption(-1);
        } else {
            onSelectOption(index);
        }
    };

    // Calculate change indicator
    const getChangeIndicator = () => {
        const prev = parseFloat(previousDose) || 0;
        const current = parseFloat(newDose) || 0;

        if (prev === 0 && current > 0) {
            return (
                <div className="text-gray-600">
                    <div className="text-3xl font-bold">ขนาดยาใหม่</div>
                    <div className="text-lg">{current.toFixed(1)} mg/wk</div>
                </div>
            );
        }

        if (prev === 0) return null;

        const changePercent = ((current - prev) / prev) * 100;
        const changeMg = current - prev;

        if (Math.abs(changePercent) < 0.1) {
            return (
                <div className="text-blue-600">
                    <div className="text-3xl font-bold">คงที่ (0.0%)</div>
                    <div className="text-lg">{prev.toFixed(1)} → {current.toFixed(1)} mg/wk</div>
                </div>
            );
        } else if (changePercent > 0) {
            return (
                <div className="text-green-600">
                    <div className="text-3xl font-bold">▲ increase {changePercent.toFixed(1)}%</div>
                    <div className="text-lg">{prev.toFixed(1)} → {current.toFixed(1)} mg/wk (+{changeMg.toFixed(1)} mg)</div>
                </div>
            );
        } else {
            return (
                <div className="text-red-600">
                    <div className="text-3xl font-bold">▼ decrease {Math.abs(changePercent).toFixed(1)}%</div>
                    <div className="text-lg">{prev.toFixed(1)} → {current.toFixed(1)} mg/wk ({changeMg.toFixed(1)} mg)</div>
                </div>
            );
        }
    };

    return (
        <div>
            {/* Dose Input Section */}
            <div className="section-card rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <svg className="w-5 h-5 text-pink-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    ข้อมูลขนาดยา
                </h2>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="input-group flex-grow w-full md:w-auto">
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            className="input-field w-full h-12 px-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder=" "
                            value={previousDose}
                            onChange={(e) => {
                                setPreviousDose(e.target.value);
                                setShowResults(false);
                                onSelectOption(-1);
                            }}
                        />
                        <label className="input-label">ขนาดยาก่อนหน้า (mg/wk)</label>
                    </div>
                    <div className="input-group flex-grow w-full md:w-auto">
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            className="input-field w-full h-12 px-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-orange-50"
                            placeholder=" "
                            value={newDose}
                            onChange={(e) => {
                                setNewDose(e.target.value);
                                setShowResults(false);
                                onSelectOption(-1);
                            }}
                        />
                        <label className="input-label" style={{ backgroundColor: '#fff7ed' }}>ขนาดยาใหม่ (mg/wk)</label>
                    </div>
                    <div className="flex-shrink-0 flex gap-2 w-full md:w-auto">
                        <button
                            onClick={handleCalculate}
                            className="h-12 w-full md:w-auto bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors shadow-md text-sm"
                        >
                            Generate
                        </button>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="h-12 w-full md:w-auto bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors shadow-md text-sm"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Change Indicator */}
                {newDose && parseFloat(newDose) > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                        {getChangeIndicator()}
                    </div>
                )}
            </div>

            {/* Adjustment Buttons */}
            {parseFloat(previousDose) > 0 && (
                <div className="section-card rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">ปรับขนาดยาอัตโนมัติ</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
                        {[-25, -20, -15, -10, -5].map(pct => (
                            <button
                                key={pct}
                                onClick={() => adjustDose(pct)}
                                className="px-3 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm"
                            >
                                {pct}%
                            </button>
                        ))}
                        {[5, 10, 15, 20, 25].map(pct => (
                            <button
                                key={pct}
                                onClick={() => adjustDose(pct)}
                                className="px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm"
                            >
                                +{pct}%
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Results */}
            {showResults && (
                <div>
                    {allOptions.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-blue-800 font-medium">
                                พบตัวเลือกทั้งหมด {allOptions.length} แบบ
                            </div>
                        </div>
                    )}

                    {displayedOptions.map((option, index) => (
                        <OptionCard
                            key={index}
                            option={option}
                            optionNumber={index + 1}
                            index={index}
                            isSelected={selectedOption === index}
                            onSelect={() => handleSelectOption(index)}
                            dayOrder={dayOrder}
                            dateConfig={dateConfig}
                        />
                    ))}

                    {allOptions.length === 0 && (
                        <div className="text-gray-600 text-center p-4">
                            {availablePills.length === 0
                                ? 'กรุณาเลือกขนาดยาอย่างน้อย 1 ขนาด'
                                : 'ไม่พบตัวเลือกที่เหมาะสม'}
                        </div>
                    )}

                    {allOptions.length > displayedCount && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={handleLoadMore}
                                className="w-auto mx-auto px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 shadow-md"
                            >
                                ตัวเลือกเพิ่มเติม
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
