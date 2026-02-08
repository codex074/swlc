import React, { useState } from 'react';
import Swal from 'sweetalert2';
import DayCard from './DayCard';
import PillModal from './PillModal';
import MedicationInstructions from './MedicationInstructions';
import { calculateDailyDose } from '../utils/pillCalculator';

export default function ManualMode({ dayOrder, dateConfig, onPrint }) {
    const [manualSchedule, setManualSchedule] = useState([[], [], [], [], [], [], []]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentDayIndex, setCurrentDayIndex] = useState(null);

    const startDay = dayOrder === 'sunday' ? 0 : 1;

    const handleOpenModal = (dayIndex) => {
        setCurrentDayIndex(dayIndex);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentDayIndex(null);
    };

    const handleAddPills = (dayIndex, pills) => {
        setManualSchedule(prev => {
            const newSchedule = [...prev];
            newSchedule[dayIndex] = [...newSchedule[dayIndex], ...pills];
            return newSchedule;
        });
    };

    const handleRemovePill = (dayIndex, pillIndex) => {
        setManualSchedule(prev => {
            const newSchedule = [...prev];
            newSchedule[dayIndex] = [
                ...newSchedule[dayIndex].slice(0, pillIndex),
                ...newSchedule[dayIndex].slice(pillIndex + 1)
            ];
            return newSchedule;
        });
    };

    const handleClearAll = () => {
        Swal.fire({
            title: 'ยืนยันการล้างข้อมูล?',
            text: 'ข้อมูลการจัดยาทั้งหมดจะถูกลบ',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ล้างทั้งหมด!',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                setManualSchedule([[], [], [], [], [], [], []]);
                Swal.fire('ล้างข้อมูลแล้ว!', 'คุณสามารถเริ่มจัดยาใหม่ได้เลย', 'success');
            }
        });
    };

    // Calculate totals
    const dailyDoses = manualSchedule.map(pills => calculateDailyDose(pills));
    const totalWeeklyDose = dailyDoses.reduce((a, b) => a + b, 0);

    // Create option object for MedicationInstructions
    const manualOption = {
        dailyDoses,
        combos: manualSchedule
    };

    const handlePrint = () => {
        if (onPrint && totalWeeklyDose > 0) {
            onPrint(manualOption, totalWeeklyDose);
        }
    };

    return (
        <div>
            {/* Day Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-6" id="manual-schedule-grid">
                {Array.from({ length: 7 }).map((_, i) => {
                    const dayIndex = (startDay + i) % 7;
                    return (
                        <DayCard
                            key={dayIndex}
                            dayIndex={dayIndex}
                            pills={manualSchedule[dayIndex]}
                            onAddPill={handleOpenModal}
                            onRemovePill={handleRemovePill}
                        />
                    );
                })}
            </div>

            {/* Summary Section */}
            <div className="section-card rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg md:w-auto flex-grow">
                        <div className="text-gray-600 text-sm">ขนาดยารวมต่อสัปดาห์</div>
                        <div className="text-3xl font-bold text-blue-600">{totalWeeklyDose.toFixed(2)} mg</div>
                    </div>
                    <div className="flex-shrink-0">
                        <button
                            onClick={handleClearAll}
                            className="w-full md:w-auto bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors shadow-md text-sm"
                        >
                            ล้างทั้งหมด
                        </button>
                    </div>
                </div>
            </div>

            {/* Manual Summary Card */}
            <div className="section-card rounded-lg shadow-md p-6" id="manual-summary-card">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">สรุปและวิธีกินยา</h3>
                    {totalWeeklyDose > 0 && (
                        <button
                            onClick={handlePrint}
                            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 shadow-md text-sm flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>พิมพ์</span>
                        </button>
                    )}
                </div>

                {totalWeeklyDose > 0 || manualSchedule.flat().length > 0 ? (
                    <MedicationInstructions option={manualOption} dateConfig={dateConfig} />
                ) : (
                    <div className="text-center text-gray-500 p-4">ยังไม่มีการจัดยา</div>
                )}
            </div>

            {/* Pill Modal */}
            <PillModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                dayIndex={currentDayIndex}
                onAddPill={handleAddPills}
            />
        </div>
    );
}
