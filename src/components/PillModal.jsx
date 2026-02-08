import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FULL_THAI_DAYS, DAY_HEADER_COLORS, getStrengthColorClasses } from '../utils/constants';

export default function PillModal({ isOpen, onClose, dayIndex, onAddPill }) {
    const [selectedStrength, setSelectedStrength] = useState(2);
    const [quantity, setQuantity] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const mg = selectedStrength;
        const quantityDecimal = parseFloat(quantity);

        if (!quantity) {
            Swal.fire({
                icon: 'warning',
                title: 'กรุณากรอกข้อมูล',
                text: 'กรุณากรอกจำนวนเม็ดยาที่ต้องการ'
            });
            return;
        }

        if (isNaN(mg) || mg <= 0) {
            Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'กรุณาเลือกขนาดยาก่อน' });
            return;
        }

        if (isNaN(quantityDecimal) || quantityDecimal <= 0) {
            onClose();
            return;
        }

        const pillsToAdd = [];
        const fullPills = Math.floor(quantityDecimal);
        const remainder = quantityDecimal % 1;

        if (fullPills > 0) {
            for (let i = 0; i < fullPills; i++) {
                pillsToAdd.push({ mg, count: 1, half: false, quarter: false });
            }
        }

        if (Math.abs(remainder - 0.25) < 0.01) {
            pillsToAdd.push({ mg, count: 1, half: false, quarter: true });
        } else if (Math.abs(remainder - 0.5) < 0.01) {
            pillsToAdd.push({ mg, count: 1, half: true, quarter: false });
        } else if (Math.abs(remainder - 0.75) < 0.01) {
            pillsToAdd.push({ mg, count: 1, half: true, quarter: false });
            pillsToAdd.push({ mg, count: 1, half: false, quarter: true });
        }

        onAddPill(dayIndex, pillsToAdd);
        setQuantity('');
        onClose();
    };

    const handleStrengthSelect = (strength) => {
        setSelectedStrength(strength);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
                <div className={`h-2 w-full ${DAY_HEADER_COLORS[dayIndex]}`} />
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4 text-center">
                        เพิ่มยาสำหรับวัน{FULL_THAI_DAYS[dayIndex]}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                เลือกขนาดยา (mg)
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                                {[1, 2, 3, 4, 5].map((strength) => {
                                    const colors = getStrengthColorClasses(String(strength));
                                    const isSelected = selectedStrength === strength;
                                    return (
                                        <button
                                            key={strength}
                                            type="button"
                                            onClick={() => handleStrengthSelect(strength)}
                                            className={`strength-btn ${colors.border} ${isSelected
                                                    ? `selected ${colors.bg} text-white`
                                                    : `bg-white ${colors.text}`
                                                }`}
                                        >
                                            {strength}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="pill-quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                จำนวน (เม็ด)
                            </label>
                            <input
                                type="number"
                                id="pill-quantity"
                                step="0.25"
                                min="0"
                                placeholder="เช่น 1, 1.5, 0.75"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
