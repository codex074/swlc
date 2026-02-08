import React, { useState, useEffect } from 'react';
import { FLOAT_TOLERANCE, getPillColorName, getPillBgColor, THAI_DAYS, DAY_HEADER_COLORS, FULL_THAI_DAYS } from '../utils/constants';
import { groupConsecutiveDays, formatDayGroups, doseToPillText } from '../utils/pillCalculator';
import { playMedicationAudio, stopAudio } from '../utils/offlineAudio';
import { PillVisual } from './Pill';

export default function PatientLabel({ schedule }) {
    const [speechState, setSpeechState] = useState('idle');

    // Get current day (JavaScript: 0=Sunday, 1=Monday, etc.)
    const today = new Date().getDay();

    // Convert compressed schedule back to full format
    const option = {
        dailyDoses: schedule.d || [],
        combos: (schedule.c || []).map(dayCombo =>
            (dayCombo || []).map(pill => ({
                mg: pill.m,
                count: pill.n,
                half: pill.h,
                quarter: pill.q
            }))
        )
    };

    // Group medications
    const medicationGroups = {};
    const activeDays = new Set();

    (option.combos || []).forEach((combo, dayIndex) => {
        if (!combo || combo.length === 0) return;

        const dailyTotalsByStrength = {};
        combo.forEach(pill => {
            const dose = (pill.half ? 0.5 : pill.quarter ? 0.25 : 1) * pill.count * pill.mg;
            dailyTotalsByStrength[pill.mg] = (dailyTotalsByStrength[pill.mg] || 0) + dose;
            activeDays.add(dayIndex);
        });

        Object.keys(dailyTotalsByStrength).forEach(strength => {
            const totalDose = dailyTotalsByStrength[strength];
            if (totalDose > 0.01) {
                const doseKey = totalDose.toFixed(2);
                if (!medicationGroups[strength]) medicationGroups[strength] = {};
                if (!medicationGroups[strength][doseKey]) {
                    medicationGroups[strength][doseKey] = {
                        days: [],
                        totalDailyDose: totalDose
                    };
                }
                medicationGroups[strength][doseKey].days.push(dayIndex);
            }
        });
    });

    // Stop days
    const stopDays = [];
    for (let i = 0; i < 7; i++) {
        if (!activeDays.has(i)) {
            stopDays.push(i);
        }
    }

    // Calculate total weekly dose
    const totalWeeklyDose = option.dailyDoses.reduce((a, b) => a + b, 0);

    const handlePlaySpeech = () => {
        if (speechState === 'playing') {
            stopAudio();
            setSpeechState('idle');
        } else {
            playMedicationAudio(option, setSpeechState);
        }
    };

    const getSpeechButtonContent = () => {
        switch (speechState) {
            case 'loading':
                return '🔄 กำลังโหลดเสียง...';
            case 'playing':
                return (
                    <>
                        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                        <span>หยุดเล่น</span>
                    </>
                );
            default:
                return (
                    <>
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.518" />
                        </svg>
                        <span>ฟังวิธีทานยา</span>
                    </>
                );
        }
    };

    // Get pill description for a day
    const getPillDescription = (dayIndex) => {
        const combo = option.combos[dayIndex] || [];
        if (combo.length === 0) return null;

        return combo.map((pill, idx) => {
            const pillText = pill.quarter ? '¼ เม็ด' : (pill.half ? '½ เม็ด' : `${pill.count} เม็ด`);
            return (
                <div key={idx} className="flex items-center gap-1 justify-center">
                    <PillVisual combo={[pill]} />
                    <span className="text-xs">{pillText}</span>
                </div>
            );
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 py-6 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <img
                        src={`${import.meta.env.BASE_URL}hospital_logo.png`}
                        alt="โลโก้โรงพยาบาล"
                        className="h-20 object-contain inline-block mb-3"
                    />
                    <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                        ฉลากยาวาร์ฟาริน
                    </h1>
                    <p className="text-sm text-gray-600">
                        ขนาดยารวม {totalWeeklyDose.toFixed(2)} mg/สัปดาห์
                    </p>
                </div>

                {/* Daily Schedule Table */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                    <h2 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
                        <span className="text-2xl mr-2">📅</span>
                        ตารางยาประจำวัน
                    </h2>
                    <div className="grid grid-cols-7 gap-1">
                        {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
                            const isToday = dayIndex === today;
                            const hasNoPill = !activeDays.has(dayIndex);

                            return (
                                <div
                                    key={dayIndex}
                                    className={`rounded-lg overflow-hidden ${isToday ? 'ring-3 ring-blue-500 ring-offset-1' : ''}`}
                                >
                                    {/* Day Header */}
                                    <div className={`${DAY_HEADER_COLORS[dayIndex]} text-white text-center py-1 text-xs font-bold relative`}>
                                        {THAI_DAYS[dayIndex]}
                                        {isToday && (
                                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] px-1 rounded-full animate-pulse">
                                                วันนี้
                                            </span>
                                        )}
                                    </div>

                                    {/* Pill Content */}
                                    <div className={`min-h-[60px] p-1 flex flex-col items-center justify-center ${isToday ? 'bg-blue-50' : 'bg-gray-50'} ${hasNoPill ? 'bg-red-50' : ''}`}>
                                        {hasNoPill ? (
                                            <div className="text-center">
                                                <span className="text-lg">🚫</span>
                                                <p className="text-[9px] text-red-600 font-medium">หยุดยา</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                {getPillDescription(dayIndex)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Today's Highlight */}
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">📌</span>
                            <div>
                                <p className="text-sm font-bold text-blue-800">
                                    วันนี้ ({FULL_THAI_DAYS[today]})
                                </p>
                                {activeDays.has(today) ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        {(option.combos[today] || []).map((pill, idx) => {
                                            const pillText = pill.quarter ? 'หนึ่งส่วนสี่เม็ด' : (pill.half ? 'ครึ่งเม็ด' : `${pill.count} เม็ด`);
                                            return (
                                                <span key={idx} className="text-sm text-gray-700">
                                                    <strong>{getPillColorName(pill.mg)}</strong> {pillText}
                                                </span>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-red-600 font-medium">หยุดยาวันนี้</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medication Instructions Card */}
                <div className="bg-white rounded-xl shadow-lg p-5 mb-4">
                    <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center">
                        <span className="text-2xl mr-2">💊</span>
                        วิธีกินยา
                    </h2>

                    <div className="flex flex-col gap-3">
                        {Object.keys(medicationGroups).length === 0 ? (
                            <p className="text-gray-700 font-semibold">หยุดยาทุกวันตามคำสั่งแพทย์</p>
                        ) : (
                            Object.keys(medicationGroups)
                                .sort((a, b) => b - a)
                                .map(strength => {
                                    const mg = parseInt(strength);
                                    const doseGroups = medicationGroups[strength];

                                    return Object.keys(doseGroups)
                                        .sort((a, b) => b - a)
                                        .map(doseKey => {
                                            const group = doseGroups[doseKey];
                                            const { days: instrDays, totalDailyDose } = group;
                                            const pillText = doseToPillText(totalDailyDose, mg);
                                            const dayText = formatDayGroups(groupConsecutiveDays(instrDays));
                                            const freq = instrDays.length;

                                            return (
                                                <div
                                                    key={`${mg}-${doseKey}`}
                                                    className={`text-sm p-4 ${getPillBgColor(mg)} border rounded-lg flex items-center`}
                                                >
                                                    <div className="flex-shrink-0 w-12 flex justify-center items-center mr-3">
                                                        <PillVisual combo={[{ mg, count: 1, half: false, quarter: false }]} />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="font-semibold text-gray-800">
                                                            {mg} mg ({getPillColorName(mg)})
                                                        </div>
                                                        <div className="text-gray-700">
                                                            กิน <strong>{pillText}</strong>
                                                            {freq === 7 ? (
                                                                <span> ทุกวัน</span>
                                                            ) : (
                                                                <span> สัปดาห์ละ {freq} ครั้ง เฉพาะ <strong>{dayText}</strong></span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        });
                                })
                        )}

                        {stopDays.length > 0 && stopDays.length < 7 && (
                            <div className="text-sm p-4 bg-red-50 border-red-200 border rounded-lg flex items-center">
                                <div className="flex-shrink-0 w-12 flex justify-center items-center mr-3 text-3xl">🚫</div>
                                <div className="flex-grow">
                                    <strong className="text-red-700">หยุดยา</strong>
                                    <span className="text-gray-700"> ใน <strong>{formatDayGroups(groupConsecutiveDays(stopDays))}</strong></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Audio Button */}
                    <button
                        onClick={handlePlaySpeech}
                        disabled={speechState === 'loading'}
                        className="w-full mt-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-md"
                    >
                        {getSpeechButtonContent()}
                    </button>
                </div>

                {/* Additional Instructions */}
                <div className="bg-white rounded-xl shadow-lg p-5">
                    <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center">
                        <span className="text-2xl mr-2">📋</span>
                        คำแนะนำเพิ่มเติม
                    </h2>
                    <ol className="list-decimal list-inside text-sm text-gray-700 space-y-3">
                        <li>
                            <span className="font-medium">รับประทานยาอย่างต่อเนื่อง</span> เวลาเดียวกันทุกวัน เช่น ก่อนนอน
                            หากลืมทานไม่เกิน 12 ชั่วโมง ให้รับประทานทันทีที่นึกได้ ถ้าเกินแล้วให้ข้ามไปมื้อถัดไปได้เลย
                        </li>
                        <li>
                            <span className="font-medium">ห้ามหยุดยาเอง</span> และหากต้องเข้ารับการรักษาในที่อื่น หรือซื้อยาจากร้านยา
                            ให้แจ้งทุกครั้งว่าท่านใช้ทานยาวาร์ฟารินอยู่
                        </li>
                        <li>
                            <span className="font-medium">ยาบางชนิด</span> เช่น ยาแก้ปวด ยาฆ่าเชื้อ สมุนไพร อาหารเสริม
                            อาจส่งผลต่อระดับยาในเลือดได้ ควรปรึกษาแพทย์หรือเภสัชกรก่อนใช้
                        </li>
                        <li>
                            หากมี<span className="font-medium text-red-600">อาการเลือดออกผิดปกติ</span> เช่น ฟกช้ำ เลือดกำเดาไหลไม่หยุด
                            อุจจาระสีดำ อาเจียนเป็นเลือด ให้รีบมาพบแพทย์ทันที
                        </li>
                    </ol>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-xs text-gray-500">
                    <p>กลุ่มงานเภสัชกรรม โรงพยาบาลอุตรดิตถ์</p>
                </div>
            </div>
        </div>
    );
}
