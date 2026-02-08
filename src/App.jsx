import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import AutoMode from './components/AutoMode';
import ManualMode from './components/ManualMode';
import DateCalculator from './components/DateCalculator';
import './index.css';

function App() {
  // Mode state
  const [mode, setMode] = useState('auto'); // 'auto' or 'manual'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Settings state
  const [pillSettings, setPillSettings] = useState({
    1: true, 2: true, 3: true, 4: true, 5: true
  });
  const [allowHalf, setAllowHalf] = useState(true);
  const [allowQuarter, setAllowQuarter] = useState(false);
  const [dayOrder, setDayOrder] = useState('monday');
  const [specialPattern, setSpecialPattern] = useState('weekend');

  // Date calculator state
  const [useDateRange, setUseDateRange] = useState(false);
  const [useWeeks, setUseWeeks] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numberOfWeeks, setNumberOfWeeks] = useState(1);

  // Auto mode selection
  const [selectedOption, setSelectedOption] = useState(-1);
  const [allOptions, setAllOptions] = useState([]);

  // Manual mode ref for printing
  const manualModeRef = useRef(null);

  // Scroll state
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Date calculator config
  const dateConfig = {
    useDateRange,
    useWeeks,
    startDate,
    endDate,
    numberOfWeeks
  };

  // Handlers
  const togglePill = (mg) => {
    setPillSettings(prev => ({ ...prev, [mg]: !prev[mg] }));
    setSelectedOption(-1);
  };

  const handleToggleDateRange = () => {
    if (!useDateRange) {
      setStartDate(new Date().toISOString().split('T')[0]);
      setUseWeeks(false);
    }
    setUseDateRange(!useDateRange);
  };

  const handleToggleWeeks = () => {
    if (!useWeeks) {
      setUseDateRange(false);
    }
    setUseWeeks(!useWeeks);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Print functionality
  const printContent = (option) => {
    // Calculate total dose from option
    const totalDose = option?.dailyDoses?.reduce((a, b) => a + b, 0) || 0;

    const printDiv = document.createElement('div');
    printDiv.className = 'print-content';

    // Header
    const header = document.createElement('div');
    header.className = 'print-header';
    header.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="/hospital_logo.png" style="height: 60px; margin: 0 auto 10px;" />
        <div class="print-title">ขนาดยาวาร์ฟาริน (Warfarin) ที่รับประทาน</div>
        <div class="print-subtitle">ขนาดยารวม ${totalDose.toFixed(2)} mg/สัปดาห์</div>
        <div style="font-size: 12px; margin-top: 5px;">
          วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    `;
    printDiv.appendChild(header);

    // Get the card to print
    let cardToPrint;
    if (mode === 'auto' && selectedOption >= 0) {
      cardToPrint = document.getElementById(`option-card-${selectedOption}`);
    } else if (mode === 'manual') {
      cardToPrint = document.getElementById('manual-summary-card');
    }

    if (cardToPrint) {
      const clonedCard = cardToPrint.cloneNode(true);
      clonedCard.querySelectorAll('.no-print').forEach(el => el.remove());
      clonedCard.querySelector('h4')?.remove();
      // Remove checkbox
      clonedCard.querySelector('.option-checkbox')?.remove();
      printDiv.appendChild(clonedCard);
    }

    // Two-column layout: Instructions on left, QR on right
    const twoColumnHtml = `
      <div style="display: flex; gap: 16px; margin-top: 16px; padding-top: 12px; border-top: 1px dashed #999;">
        <div style="flex: 1; text-align: left; font-size: 12px;">
          <h5 style="font-weight: bold; margin-bottom: 6px; font-size: 13px;">คำแนะนำเพิ่มเติม:</h5>
          <ol style="list-style-type: decimal; padding-left: 18px; margin: 0; line-height: 1.4;">
            <li style="margin-bottom: 3px;">ควรรับประทานยาอย่างต่อเนื่อง เวลาเดียวกันทุกวัน เช่น ก่อนนอน หากลืมทานไม่เกิน 12 ชั่วโมง ให้รับประทานทันทีที่นึกได้ ถ้าเกินแล้วให้ข้ามไปมื้อถัดไปได้เลย</li>
            <li style="margin-bottom: 3px;">ห้ามหยุดยาเอง และหากต้องเข้ารับการรักษาในที่อื่น หรือซื้อยาจากร้านยา ให้แจ้งทุกครั้งว่าท่านใช้ทานยาวาร์ฟารินอยู่</li>
            <li style="margin-bottom: 3px;">ยาบางชนิด เช่น ยาแก้ปวด ยาฆ่าเชื้อ สมุนไพร อาหารเสริม อาจส่งผลต่อระดับยาในเลือดได้ ควรปรึกษาแพทย์หรือเภสัชกรก่อนใช้</li>
            <li>หากมีอาการเลือดออกผิดปกติ เช่น ฟกช้ำ เลือดกำเดาไหลไม่หยุด อุจจาระสีดำ อาเจียนเป็นเลือด ให้รีบมาพบแพทย์ทันที</li>
          </ol>
        </div>
        <div style="flex-shrink: 0; text-align: center; padding-left: 12px; border-left: 1px dashed #ccc;">
          <div class="qr-print-area" style="width: 180px;"></div>
          <p style="font-size: 11px; color: #666; margin-top: 4px;">สแกนเพื่อแสดง<br/>ฉลากออนไลน์</p>
        </div>
      </div>
    `;

    const twoColumnDiv = document.createElement('div');
    twoColumnDiv.innerHTML = twoColumnHtml;

    // Copy QR code from card to print area
    if (cardToPrint) {
      const qrContainer = cardToPrint.querySelector('.qr-code-container');
      if (qrContainer) {
        const qrClone = qrContainer.querySelector('svg')?.cloneNode(true);
        if (qrClone) {
          qrClone.setAttribute('width', '180');
          qrClone.setAttribute('height', '180');
          twoColumnDiv.querySelector('.qr-print-area').appendChild(qrClone);
        }
      }
    }

    printDiv.appendChild(twoColumnDiv);

    // Append and print
    document.body.appendChild(printDiv);

    // Force single page by setting explicit height
    printDiv.style.height = 'auto';
    printDiv.style.overflow = 'visible';

    window.print();
    setTimeout(() => {
      document.body.removeChild(printDiv);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pillSettings={pillSettings}
        onTogglePill={togglePill}
        allowHalf={allowHalf}
        onToggleHalf={() => { setAllowHalf(!allowHalf); setSelectedOption(-1); }}
        allowQuarter={allowQuarter}
        onToggleQuarter={() => { setAllowQuarter(!allowQuarter); setSelectedOption(-1); }}
        dayOrder={dayOrder}
        onSetDayOrder={(o) => { setDayOrder(o); setSelectedOption(-1); }}
        specialPattern={specialPattern}
        onSetSpecialPattern={(p) => { setSpecialPattern(p); setSelectedOption(-1); }}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl" id="main-content">
        {/* Header */}
        <div className="relative mb-8 pt-2">
          <div className="absolute top-0 left-0 flex gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline">ตั้งค่าเพิ่มเติม</span>
              <span className="sm:hidden">ตั้งค่า</span>
            </button>
            <a
              href="https://drive.google.com/file/d/1H_ffzcYP7oz2UA6_AolPjNC5k02qiZoD/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="hidden sm:inline">คู่มือการใช้งาน</span>
              <span className="sm:hidden">คู่มือ</span>
            </a>
          </div>

          <div className="text-center">
            <img
              src="/hospital_logo.png"
              alt="โลโก้โรงพยาบาล"
              id="hospital-logo"
              className="h-28 object-contain inline-block mb-4"
            />
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              คำนวณขนาดยา Warfarin
            </h1>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6 gap-2">
          <button
            type="button"
            onClick={() => setMode('auto')}
            className={`toggle-btn ${mode === 'auto' ? 'active' : ''}`}
          >
            คำนวณอัตโนมัติ
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`toggle-btn ${mode === 'manual' ? 'active' : ''}`}
          >
            สร้างฉลากยาเอง
          </button>
        </div>

        {/* Auto Mode */}
        {mode === 'auto' && (
          <>
            <AutoMode
              pillSettings={pillSettings}
              allowHalf={allowHalf}
              allowQuarter={allowQuarter}
              specialPattern={specialPattern}
              dayOrder={dayOrder}
              dateConfig={dateConfig}
              selectedOption={selectedOption}
              onSelectOption={setSelectedOption}
              onPrint={printContent}
            />
            <DateCalculator
              useDateRange={useDateRange}
              onToggleDateRange={handleToggleDateRange}
              useWeeks={useWeeks}
              onToggleWeeks={handleToggleWeeks}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              numberOfWeeks={numberOfWeeks}
              onNumberOfWeeksChange={setNumberOfWeeks}
            />
          </>
        )}

        {/* Manual Mode */}
        {mode === 'manual' && (
          <>
            <ManualMode
              ref={manualModeRef}
              dayOrder={dayOrder}
              dateConfig={dateConfig}
              onPrint={printContent}
            />
            <DateCalculator
              useDateRange={useDateRange}
              onToggleDateRange={handleToggleDateRange}
              useWeeks={useWeeks}
              onToggleWeeks={handleToggleWeeks}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              numberOfWeeks={numberOfWeeks}
              onNumberOfWeeksChange={setNumberOfWeeks}
            />
          </>
        )}
      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
        {mode === 'auto' && selectedOption >= 0 && (
          <button
            onClick={() => {
              // Get the dose from the selected card's data attribute
              const card = document.getElementById(`option-card-${selectedOption}`);
              const dose = parseFloat(card?.dataset.totalDose || '0');
              printContent({ dailyDoses: Array(7).fill(dose / 7) });
            }}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
            title="พิมพ์ตัวเลือกที่เลือก"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
        )}
        <button
          onClick={scrollToTop}
          className={`bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 ${showBackToTop ? '' : 'opacity-0 invisible'
            }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-4 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-1">
            <span className="text-sm font-medium text-gray-700">© 2025 ระบบคำนวณขนาดยา Warfarin</span>
          </div>
          <div className="text-gray-600">
            <div className="mb-1 text-xs">พัฒนาโดย <span className="font-medium text-blue-600">ภก.ธีรเดช วิชัย</span></div>
            <div className="text-xs">กลุ่มงานเภสัชกรรม โรงพยาบาลอุตรดิตถ์</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
