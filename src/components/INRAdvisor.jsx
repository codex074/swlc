import React, { useState } from 'react';

// INR Dosing Guidelines
function getINRAdvice(inr, twd, isMajorBleeding) {
    // Major bleeding is emergency regardless of INR
    if (isMajorBleeding || inr > 20) {
        return {
            level: 'critical',
            color: 'red',
            title: '🚨 กรณีฉุกเฉิน: เลือดออกรุนแรง',
            actions: [
                'หยุดยา Warfarin ทันที',
                'ให้ Vitamin K1 ขนาด 10 mg แบบ Slow IV (1 mg/min)',
                'สามารถให้ Vitamin K1 ซ้ำได้ทุก 12 ชั่วโมง',
                'ให้ FFP (Fresh Frozen Plasma) หรือ rFVIIa ร่วมด้วย'
            ],
            adjustment: null,
            newTwd: null
        };
    }

    if (inr >= 9) {
        return {
            level: 'critical',
            color: 'red',
            title: '🔴 INR สูงมาก (≥ 9)',
            actions: [
                'หยุดยา Warfarin',
                'ให้ Vitamin K1 ขนาด 5-10 mg ทางปาก (Orally)',
                'ติดตามค่า INR อย่างใกล้ชิด'
            ],
            adjustment: 'หยุดยา',
            newTwd: 0
        };
    }

    if (inr >= 5.0 && inr <= 8.9) {
        const newDose = twd ? Math.round(twd * 0.8 * 100) / 100 : null;
        return {
            level: 'high',
            color: 'red',
            title: '🔴 INR สูงมาก (5.0-8.9)',
            actions: [
                'หยุดยา 1-2 มื้อถัดไป',
                `ลดขนาดยา 20% ของ TWD`,
                twd ? `ขนาดยาใหม่: ${newDose} mg/สัปดาห์` : '',
                'เริ่มยาหลังจากค่า INR กลับสู่ระดับปกติ',
                '⚠️ กรณีเสี่ยงเลือดออกสูง: ให้ Vitamin K1 1 mg ทางปาก'
            ].filter(Boolean),
            adjustment: 'ลด 20%',
            newTwd: newDose
        };
    }

    if (inr >= 4.0 && inr <= 4.9) {
        const newDose = twd ? Math.round(twd * 0.9 * 100) / 100 : null;
        return {
            level: 'high',
            color: 'orange',
            title: '🟠 INR สูง (4.0-4.9)',
            actions: [
                'หยุดยาในมื้อถัดไป',
                `ลดขนาดยา 10% ของ TWD`,
                twd ? `ขนาดยาใหม่: ${newDose} mg/สัปดาห์` : ''
            ].filter(Boolean),
            adjustment: 'ลด 10%',
            newTwd: newDose
        };
    }

    if (inr >= 3.1 && inr <= 3.9) {
        const minDose = twd ? Math.round(twd * 0.95 * 100) / 100 : null;
        const maxDose = twd ? Math.round(twd * 0.9 * 100) / 100 : null;
        return {
            level: 'medium',
            color: 'yellow',
            title: '🟡 INR สูงกว่าเป้าหมายเล็กน้อย (3.1-3.9)',
            actions: [
                `ลดขนาดยา 5-10% ของ TWD`,
                twd ? `ขนาดยาใหม่: ${maxDose} - ${minDose} mg/สัปดาห์` : ''
            ].filter(Boolean),
            adjustment: 'ลด 5-10%',
            newTwd: maxDose
        };
    }

    if (inr >= 2.0 && inr <= 3.0) {
        return {
            level: 'optimal',
            color: 'green',
            title: '✅ INR อยู่ในเป้าหมาย (2.0-3.0)',
            actions: [
                'ให้ขนาดยาเดิม ไม่ต้องปรับเปลี่ยน',
                twd ? `ขนาดยาปัจจุบัน: ${twd} mg/สัปดาห์` : ''
            ].filter(Boolean),
            adjustment: 'ไม่เปลี่ยนแปลง',
            newTwd: twd
        };
    }

    if (inr >= 1.5 && inr < 2.0) {
        const minDose = twd ? Math.round(twd * 1.05 * 100) / 100 : null;
        const maxDose = twd ? Math.round(twd * 1.1 * 100) / 100 : null;
        return {
            level: 'low',
            color: 'yellow',
            title: '🟡 INR ต่ำกว่าเป้าหมายเล็กน้อย (1.5-1.9)',
            actions: [
                `เพิ่มขนาดยา 5-10% ของ TWD`,
                twd ? `ขนาดยาใหม่: ${minDose} - ${maxDose} mg/สัปดาห์` : ''
            ].filter(Boolean),
            adjustment: 'เพิ่ม 5-10%',
            newTwd: maxDose
        };
    }

    if (inr < 1.5) {
        const minDose = twd ? Math.round(twd * 1.1 * 100) / 100 : null;
        const maxDose = twd ? Math.round(twd * 1.2 * 100) / 100 : null;
        return {
            level: 'veryLow',
            color: 'orange',
            title: '🟠 INR ต่ำมาก (< 1.5)',
            actions: [
                `เพิ่มขนาดยา 10-20% ของ TWD`,
                twd ? `ขนาดยาใหม่: ${minDose} - ${maxDose} mg/สัปดาห์` : '',
                '⚠️ เลือดแข็งตัวเร็วเกินไป เสี่ยงต่อการเกิดลิ่มเลือด'
            ].filter(Boolean),
            adjustment: 'เพิ่ม 10-20%',
            newTwd: maxDose
        };
    }

    return null;
}

export default function INRAdvisor({ isOpen, onClose, currentTwd }) {
    const [inr, setInr] = useState('');
    const [twd, setTwd] = useState(currentTwd || '');
    const [isMajorBleeding, setIsMajorBleeding] = useState(false);
    const [advice, setAdvice] = useState(null);

    const handleCalculate = () => {
        const inrValue = parseFloat(inr);
        const twdValue = parseFloat(twd) || null;

        if (isNaN(inrValue) || inrValue <= 0) {
            alert('กรุณากรอกค่า INR ที่ถูกต้อง');
            return;
        }

        const result = getINRAdvice(inrValue, twdValue, isMajorBleeding);
        setAdvice(result);
    };

    const handleReset = () => {
        setInr('');
        setTwd(currentTwd || '');
        setIsMajorBleeding(false);
        setAdvice(null);
    };

    const getColorClasses = (color) => {
        switch (color) {
            case 'red':
                return 'bg-red-50 border-red-300 text-red-800';
            case 'orange':
                return 'bg-orange-50 border-orange-300 text-orange-800';
            case 'yellow':
                return 'bg-yellow-50 border-yellow-300 text-yellow-800';
            case 'green':
                return 'bg-green-50 border-green-300 text-green-800';
            default:
                return 'bg-gray-50 border-gray-300 text-gray-800';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            💊 INR Dose Advisor
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-sm text-white/80 mt-1">
                        แนะนำการปรับขนาดยา Warfarin ตามค่า INR (เป้าหมาย 2.0-3.0)
                    </p>
                </div>

                {/* Body */}
                <div className="p-5">
                    {/* Inputs */}
                    <div className="space-y-4 mb-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ค่า INR *
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={inr}
                                onChange={(e) => setInr(e.target.value)}
                                placeholder="เช่น 2.5"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ขนาดยารวมต่อสัปดาห์ (TWD) - mg/week
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={twd}
                                onChange={(e) => setTwd(e.target.value)}
                                placeholder="เช่น 21"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                ถ้ากรอก TWD จะคำนวณขนาดยาใหม่ให้อัตโนมัติ
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="majorBleeding"
                                checked={isMajorBleeding}
                                onChange={(e) => setIsMajorBleeding(e.target.checked)}
                                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                            />
                            <label htmlFor="majorBleeding" className="text-sm font-medium text-red-700">
                                🚨 มีอาการเลือดออกรุนแรง (Major Bleeding)
                            </label>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mb-5">
                        <button
                            onClick={handleCalculate}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                        >
                            คำนวณ
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            รีเซ็ต
                        </button>
                    </div>

                    {/* Result */}
                    {advice && (
                        <div className={`p-4 rounded-lg border-2 ${getColorClasses(advice.color)}`}>
                            <h3 className="font-bold text-lg mb-3">{advice.title}</h3>
                            <ul className="space-y-2">
                                {advice.actions.map((action, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-lg">•</span>
                                        <span>{action}</span>
                                    </li>
                                ))}
                            </ul>

                            {advice.newTwd !== null && advice.newTwd > 0 && (
                                <div className="mt-4 pt-3 border-t border-current/20">
                                    <p className="font-semibold">
                                        📊 ขนาดยาที่แนะนำ: {advice.newTwd} mg/สัปดาห์
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reference */}
                    <div className="mt-5 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                        <p className="font-semibold mb-1">📋 หมายเหตุ:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>INR เป้าหมาย: 2.0 - 3.0</li>
                            <li>TWD = Total Weekly Dose (ขนาดยารวมต่อสัปดาห์)</li>
                            <li>คำแนะนำนี้เป็นแนวทางเบื้องต้น โปรดปรึกษาแพทย์ก่อนปรับยา</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
