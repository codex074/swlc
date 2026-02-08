import React from 'react';

const INR_GUIDELINES = [
    {
        range: '< 1.5',
        color: 'orange',
        bgColor: 'bg-orange-50',
        actions: 'เพิ่มขนาดยา 10-20% ของ TWD\n⚠️ เสี่ยงต่อการเกิดลิ่มเลือด'
    },
    {
        range: '1.5 - 1.9',
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        actions: 'เพิ่มขนาดยา 5-10% ของ TWD'
    },
    {
        range: '2.0 - 3.0',
        color: 'green',
        bgColor: 'bg-green-100',
        actions: '✅ ให้ขนาดยาเดิม (เป้าหมาย)'
    },
    {
        range: '3.1 - 3.9',
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        actions: 'ลดขนาดยา 5-10% ของ TWD'
    },
    {
        range: '4.0 - 4.9',
        color: 'orange',
        bgColor: 'bg-orange-50',
        actions: 'หยุดยา 1 มื้อ แล้วลดขนาดยา 10%'
    },
    {
        range: '5.0 - 8.9',
        color: 'red',
        bgColor: 'bg-red-50',
        actions: 'หยุดยา 1-2 มื้อ แล้วลดขนาดยา 20%\n⚠️ เสี่ยงสูง: ให้ Vit K1 1 mg PO'
    },
    {
        range: '≥ 9',
        color: 'red',
        bgColor: 'bg-red-100',
        actions: 'หยุดยา + ให้ Vit K1 5-10 mg PO\nติดตาม INR ใกล้ชิด'
    }
];

export default function INRAdvisor({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-xl sticky top-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            📋 INR Dosing Guidelines
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-sm text-white/80 mt-1">
                        เป้าหมาย INR: 2.0 - 3.0
                    </p>
                </div>

                {/* Body */}
                <div className="p-4">
                    {/* Emergency Box */}
                    <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg">
                        <div className="font-bold text-red-800 text-sm mb-1">
                            🚨 Major Bleeding with any INR or INR &gt; 20
                        </div>
                        <div className="text-xs text-red-700">
                            หยุดยา + Vit K1 10 mg slow IV + FFP/rFVIIa
                        </div>
                    </div>

                    {/* Guidelines Table */}
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-purple-100">
                                <th className="border border-purple-300 px-3 py-2 text-left font-semibold text-purple-800 w-28">
                                    ค่า INR
                                </th>
                                <th className="border border-purple-300 px-3 py-2 text-left font-semibold text-purple-800">
                                    การจัดการและการปรับยา
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {INR_GUIDELINES.map((item, index) => (
                                <tr key={index} className={item.bgColor}>
                                    <td className="border border-gray-300 px-3 py-2 font-medium text-gray-800">
                                        {item.range}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-gray-700 whitespace-pre-line">
                                        {item.actions}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Reference Note */}
                    <div className="mt-4 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                        <span className="font-medium">📋 TWD</span> = Total Weekly Dose (ขนาดยารวม/สัปดาห์)
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}
