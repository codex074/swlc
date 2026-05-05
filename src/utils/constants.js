// Thai day names
export const THAI_DAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
export const FULL_THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

// Day header colors (Tailwind classes)
export const DAY_HEADER_COLORS = [
    'bg-red-600',    // Sunday
    'bg-yellow-500', // Monday
    'bg-pink-600',   // Tuesday
    'bg-green-600',  // Wednesday
    'bg-orange-600', // Thursday
    'bg-blue-600',   // Friday
    'bg-purple-600'  // Saturday
];

// Pill color configurations
export const PILL_COLORS = {
    1: { name: 'สีขาว', bgClass: 'bg-gray-100', borderClass: 'border-gray-300', textClass: 'text-gray-600' },
    2: { name: 'สีส้ม', bgClass: 'bg-orange-100', borderClass: 'border-orange-300', textClass: 'text-orange-600' },
    3: { name: 'สีฟ้า', bgClass: 'bg-blue-100', borderClass: 'border-blue-300', textClass: 'text-sky-600' },
    4: { name: 'สีเหลือง', bgClass: 'bg-yellow-100', borderClass: 'border-yellow-300', textClass: 'text-amber-600' },
    5: { name: 'สีชมพู', bgClass: 'bg-pink-100', borderClass: 'border-pink-300', textClass: 'text-pink-600' }
};

// Public base URL for QR codes
export const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_BASE_URL || 'https://codex074.github.io/swlc/';

// Algorithm constants
export const FLOAT_TOLERANCE = 0.01;
export const OPTIONS_PER_PAGE = 10;

// Utility functions
export function getThaiDayIndex(jsDay) {
    return jsDay === 0 ? 6 : jsDay - 1;
}

export function roundToHalf(num) {
    const decimal = num % 1;
    const integer = Math.floor(num);
    if (decimal < 0.25) return integer;
    if (decimal < 0.75) return integer + 0.5;
    return integer + 1;
}

export function getPillColorName(mg) {
    return PILL_COLORS[mg]?.name || '';
}

export function getPillBgColor(mg) {
    const color = PILL_COLORS[mg];
    if (!color) return 'bg-gray-100 border-gray-300';
    return `${color.bgClass} ${color.borderClass}`;
}

export function getStrengthColorClasses(strength) {
    const colors = {
        '5': { bg: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-500' },
        '4': { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-500' },
        '3': { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-500' },
        '2': { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-500' },
        '1': { bg: 'bg-gray-500', text: 'text-gray-600', border: 'border-gray-500' }
    };
    return colors[strength] || colors['1'];
}
