import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FLOAT_TOLERANCE, getPillColorName, getPillBgColor } from '../utils/constants';
import { groupConsecutiveDays, formatDayGroups, doseToPillText } from '../utils/pillCalculator';
import { generateQrCodeUrl } from '../utils/speechUtils';
import { playMedicationAudio, stopAudio } from '../utils/offlineAudio';
import { PillVisual } from './Pill';

export default function MedicationInstructions({ option, dateConfig }) {
    const [speechState, setSpeechState] = useState('idle');

    // Calculate days and period text
    let days = 7;
    let periodText = '1 สัปดาห์';

    if (dateConfig?.useDateRange) {
        const start = new Date(dateConfig.startDate);
        const end = new Date(dateConfig.endDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
            days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
            periodText = `${days} วัน`;
        }
    } else if (dateConfig?.useWeeks) {
        const weeks = dateConfig.numberOfWeeks || 1;
        days = weeks * 7;
        periodText = `${weeks} สัปดาห์`;
    }

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

    const handlePlaySpeech = () => {
        if (speechState === 'playing') {
            stopAudio();
            setSpeechState('idle');
        } else {
            playMedicationAudio(option, setSpeechState);
        }
    };

    const qrUrl = generateQrCodeUrl(option);

    const getSpeechButtonContent = () => {
        switch (speechState) {
            case 'loading':
                return '🔄 กำลังโหลดเสียง...';
            case 'playing':
                return (
                    <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                        <span>หยุดเล่น</span>
                    </>
                );
            default:
                return (
                    <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.518" />
                        </svg>
                        <span>ฟังวิธีทานยา</span>
                    </>
                );
        }
    };

    return (
        <div>
            <h6 className="font-medium mb-3">วิธีกินยา:</h6>
            <div className="flex flex-col gap-2">
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
                                    const numberOfWeeks = days / 7;
                                    const totalPhysicalPillsNeeded = Math.ceil((totalDailyDose / mg) * freq * numberOfWeeks);
                                    const pillCountText = totalPhysicalPillsNeeded > 0 ? `${totalPhysicalPillsNeeded} เม็ด/${periodText}` : '';

                                    return (
                                        <div
                                            key={`${mg}-${doseKey}`}
                                            className={`text-sm p-3 ${getPillBgColor(mg)} border rounded flex items-center`}
                                        >
                                            <div className="flex-shrink-0 w-10 flex justify-center items-center mr-3">
                                                <PillVisual combo={[{ mg, count: 1, half: false, quarter: false }]} />
                                            </div>
                                            <div className="flex-grow flex justify-between items-center gap-2">
                                                <span className="flex-grow">
                                                    {freq === 7 ? (
                                                        <>{mg} mg (<strong>{getPillColorName(mg)}</strong>) กิน <strong>{pillText}</strong> ทุกวัน</>
                                                    ) : (
                                                        <>{mg} mg (<strong>{getPillColorName(mg)}</strong>) กิน <strong>{pillText}</strong> สัปดาห์ละ {freq} ครั้ง เฉพาะ <strong>{dayText}</strong></>
                                                    )}
                                                </span>
                                                <span className="text-xs text-gray-600 font-semibold flex-shrink-0 whitespace-nowrap">
                                                    {pillCountText}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                });
                        })
                )}

                {stopDays.length > 0 && stopDays.length < 7 && (
                    <div className="text-sm p-3 bg-red-50 border-red-200 border rounded flex items-center">
                        <div className="flex-shrink-0 w-10 flex justify-center items-center mr-3 text-2xl">🚫</div>
                        <div className="flex-grow">
                            <strong>หยุดยา</strong> ใน <strong>{formatDayGroups(groupConsecutiveDays(stopDays))}</strong>
                        </div>
                    </div>
                )}
            </div>

            {/* Speech Button */}
            {(Object.keys(medicationGroups).length > 0 || option.dailyDoses.every(d => d < FLOAT_TOLERANCE)) && (
                <div className="mt-4 no-print">
                    <button
                        onClick={handlePlaySpeech}
                        disabled={speechState === 'loading'}
                        className="toggle-btn flex items-center justify-center"
                    >
                        {getSpeechButtonContent()}
                    </button>

                    {/* Hidden QR for print only */}
                    {qrUrl && (
                        <div className="qr-code-container" style={{ display: 'none' }}>
                            <QRCodeSVG value={qrUrl} size={156} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
