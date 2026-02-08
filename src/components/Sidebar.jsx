import React from 'react';

export default function Sidebar({
    isOpen,
    onClose,
    pillSettings,
    onTogglePill,
    allowHalf,
    onToggleHalf,
    allowQuarter,
    onToggleQuarter,
    dayOrder,
    onSetDayOrder,
    specialPattern,
    onSetSpecialPattern
}) {
    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${isOpen ? '' : 'hidden'}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">ตั้งค่าเพิ่มเติม</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Pill Selection */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">เลือกขนาดยาที่มี</h3>
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3, 4, 5].map((mg) => (
                                <button
                                    key={mg}
                                    type="button"
                                    onClick={() => onTogglePill(mg)}
                                    className={`pill-btn justify-between w-full ${pillSettings[mg] ? 'active' : ''}`}
                                >
                                    <span className="flex items-center">
                                        <span className={`pill pill-${mg}mg`} />
                                        <span>{mg} mg</span>
                                    </span>
                                    <span className="pill-btn-check">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pill Splitting */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">การแบ่งเม็ดยา</h3>
                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={onToggleHalf}
                                className={`toggle-btn ${allowHalf ? 'active' : ''}`}
                            >
                                ให้ใช้ครึ่งเม็ด (1/2)
                            </button>
                            <button
                                type="button"
                                onClick={onToggleQuarter}
                                className={`toggle-btn ${allowQuarter ? 'active' : ''}`}
                            >
                                ให้ใช้หนึ่งส่วนสี่เม็ด (1/4)
                            </button>
                        </div>
                    </div>

                    {/* Day Order */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">การจัดเรียงวันแสดงผล</h3>
                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => onSetDayOrder('sunday')}
                                className={`toggle-btn ${dayOrder === 'sunday' ? 'active' : ''}`}
                            >
                                อาทิตย์ - เสาร์
                            </button>
                            <button
                                type="button"
                                onClick={() => onSetDayOrder('monday')}
                                className={`toggle-btn ${dayOrder === 'monday' ? 'active' : ''}`}
                            >
                                จันทร์ - อาทิตย์
                            </button>
                        </div>
                    </div>

                    {/* Special Pattern */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">รูปแบบวันพิเศษ/หยุดยา</h3>
                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => onSetSpecialPattern('weekend')}
                                className={`toggle-btn ${specialPattern === 'weekend' ? 'active' : ''}`}
                            >
                                อาทิตย์/เสาร์/ศุกร์
                            </button>
                            <button
                                type="button"
                                onClick={() => onSetSpecialPattern('mwf')}
                                className={`toggle-btn ${specialPattern === 'mwf' ? 'active' : ''}`}
                            >
                                กระจายขนาดยา (ศุกร์/พุธ/จันทร์)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
