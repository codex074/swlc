import React from 'react';

export default function DateCalculator({
    useDateRange,
    onToggleDateRange,
    useWeeks,
    onToggleWeeks,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    numberOfWeeks,
    onNumberOfWeeksChange
}) {
    return (
        <div className="section-card rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">โหมดคำนวณจำนวนยาถึงวันนัด</h3>

            <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <button
                        type="button"
                        onClick={onToggleDateRange}
                        className={`toggle-btn ${useDateRange ? 'active' : ''}`}
                    >
                        ระบุวันที่นัดแบบตรงๆ
                    </button>
                    <button
                        type="button"
                        onClick={onToggleWeeks}
                        className={`toggle-btn ${useWeeks ? 'active' : ''}`}
                    >
                        ระบุจำนวนสัปดาห์ที่นัด
                    </button>
                </div>

                {/* Date Range Inputs */}
                {useDateRange && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                วันที่เริ่มต้น (วันที่มา)
                            </label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={startDate}
                                onChange={(e) => onStartDateChange(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                วันนัดครั้งถัดไป
                            </label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={endDate}
                                onChange={(e) => onEndDateChange(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Weeks Input */}
                {useWeeks && (
                    <div className="flex items-center">
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={numberOfWeeks}
                            onChange={(e) => onNumberOfWeeksChange(parseInt(e.target.value) || 1)}
                            className="w-32 h-10 px-3 text-sm border border-gray-300 rounded-md"
                        />
                        <span className="ml-2">สัปดาห์</span>
                    </div>
                )}
            </div>
        </div>
    );
}
