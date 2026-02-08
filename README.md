# SWLC React - ระบบสร้างฉลากยาวาร์ฟาริน

ระบบช่วยคำนวณและสร้างฉลากยาวาร์ฟาริน (Warfarin) สำหรับผู้ป่วย พร้อมระบบอ่านออกเสียงวิธีทานยาแบบ Offline

🔗 **Live Demo**: https://codex074.github.io/swlc/

---

## 🚀 Tech Stack

| เทคโนโลยี | เวอร์ชัน | หน้าที่ |
|-----------|---------|---------|
| React | 19.x | UI Framework |
| Vite | 7.x | Build Tool |
| Tailwind CSS | 4.x | Styling |
| Web Audio API | - | Offline Audio Player |
| QRCode.react | 4.x | สร้าง QR Code |
| SweetAlert2 | 11.x | Alert/Modal |

---

## ✨ Features

### 1. คำนวณขนาดยา
- **โหมดอัตโนมัติ**: ใส่ dose → แสดงตัวเลือก combination
- **โหมด Manual**: เลือกเม็ดยาเองทีละวัน
- รองรับยา 1-5 mg (5 สี)
- รองรับเศษ ½ และ ¼ เม็ด

### 2. ฉลากยาพิมพ์
- QR Code สำหรับเปิดฉลากออนไลน์
- คำแนะนำเพิ่มเติม 4 ข้อ
- โลโก้โรงพยาบาล

### 3. ฉลากยาออนไลน์ (สแกน QR)
- 📅 **ตารางยาประจำวัน** 7 วัน
- 🔵 **Highlight วันปัจจุบัน** พร้อม badge "วันนี้"
- 📌 **กล่องสรุปวันนี้** - บอกว่าวันนี้กินยาสีอะไร กี่เม็ด
- 🎧 **ปุ่มฟังเสียง** - อ่านวิธีทานยาแบบ Offline
- 📋 คำแนะนำเพิ่มเติม

### 4. ระบบ Offline Audio
- ใช้ **Web Audio API** เล่นเสียงต่อเนื่องไม่มี gap
- **Auto-trim silence** จากไฟล์เสียง
- รองรับการหยุดเสียงระหว่างเล่น

---

## 📁 โครงสร้างโปรเจกต์

```
swlc-react/
├── public/
│   └── audio/                    # ไฟล์เสียง
│       ├── amounts/              # จำนวนเม็ด
│       ├── days/                 # วันในสัปดาห์
│       ├── frequency/            # ความถี่
│       ├── phrases/              # คำศัพท์ทั่วไป
│       ├── pills/                # ขนาดยา+สี
│       └── audio_phrases.json
├── src/
│   ├── components/
│   │   ├── AutoMode.jsx          # โหมดอัตโนมัติ
│   │   ├── ManualMode.jsx        # โหมด Manual
│   │   ├── PatientLabel.jsx      # ⭐ ฉลากออนไลน์สำหรับผู้ป่วย
│   │   ├── MedicationInstructions.jsx
│   │   ├── DayCard.jsx
│   │   ├── OptionCard.jsx
│   │   ├── Pill.jsx
│   │   ├── PillModal.jsx
│   │   └── Sidebar.jsx
│   ├── utils/
│   │   ├── constants.js
│   │   ├── offlineAudio.js       # ⭐ Web Audio API Player
│   │   ├── pillCalculator.js
│   │   └── speechUtils.js
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

---

## 🎵 Offline Audio System

### Timing Settings

```javascript
const PAUSE_DELAY_MS = 0;        // ไม่มี pause ระหว่าง group
const OVERLAP_SECONDS = -0.01;   // 10ms gap ระหว่างเสียง
```

### ลำดับการอ่าน

```
"ยาขนาด" → "2 มิลลิกรัม สีส้ม" → "กิน" → "1 เม็ด" → 
"สัปดาห์ละ 2 ครั้ง" → "เฉพาะ" → "วันจันทร์ และวันพุธ"
```

### การเรียงลำดับวัน
- เริ่มจากวันจันทร์ (1) ไปวันเสาร์ (6) แล้วค่อยวันอาทิตย์ (0)
- เพิ่มคำว่า "และ" ก่อนวันสุดท้าย

---

## 🔧 การติดตั้งและรัน

```bash
# ติดตั้ง dependencies
npm install

# รัน development server
npm run dev

# Build สำหรับ production
npm run build

# Deploy ไป GitHub Pages
npm run deploy
```

---

## 🌐 GitHub Pages Deployment

1. ตั้งค่า `vite.config.js`:
```javascript
export default defineConfig({
  base: '/swlc/',
  plugins: [react(), tailwindcss()],
})
```

2. Deploy:
```bash
npm run deploy
```

---

## 🎨 สียา

| mg | สี | Background |
|----|-----|-----------|
| 1 | ขาว | `bg-gray-100` |
| 2 | ส้ม | `bg-orange-100` |
| 3 | ฟ้า | `bg-blue-100` |
| 4 | เหลือง | `bg-yellow-100` |
| 5 | ชมพู | `bg-pink-100` |

---

## 📱 Patient Label URL Format

```
https://codex074.github.io/swlc/?schedule={encoded_json}
```

Schedule structure:
```json
{
  "d": [2, 2, 2, 0, 0, 2, 2],  // dailyDoses
  "c": [[{m:2, n:1, h:false, q:false}], ...]  // combos
}
```

---

## 📝 License

MIT License

---

## 👤 Copyright

**© 2025 Ph.D. Teeradet Wichai**  
Pharmacy Department, Uttaradit Hospital

---
