import { FULL_THAI_DAYS, getPillColorName, PUBLIC_BASE_URL } from './constants';
import { groupConsecutiveDays, formatDayGroups } from './pillCalculator';

// Generate speech text for TTS
export function generateSpeechTextFromSchedule(schedule) {
    let speechText = '';
    const medicationGroups = {};

    (schedule.combos || []).forEach((combo, dayIndex) => {
        if (schedule.dailyDoses[dayIndex] && schedule.dailyDoses[dayIndex] > 0.01) {
            (combo || []).forEach(pill => {
                const key = `${pill.mg}-${pill.half}-${pill.quarter}-${pill.count}`;
                if (!medicationGroups[key]) medicationGroups[key] = { ...pill, days: [] };
                medicationGroups[key].days.push(dayIndex);
            });
        }
    });

    Object.values(medicationGroups).sort((a, b) => b.mg - a.mg).forEach(instr => {
        const { mg, half, quarter, count, days: instrDays } = instr;
        const pillText = quarter ? 'หนึ่งส่วนสี่เม็ด' : (half ? 'ครึ่งเม็ด' : `${count} เม็ด`);
        const dayText = formatDayGroups(groupConsecutiveDays(instrDays));
        const freq = instrDays.length;
        const line = freq === 7
            ? `ยาขนาด ${mg} มิลลิกรัม ${getPillColorName(mg)} กิน ${pillText} ทุกวัน`
            : `ยาขนาด ${mg} มิลลิกรัม ${getPillColorName(mg)} กิน ${pillText} สัปดาห์ละ ${freq} ครั้ง เฉพาะ ${dayText}`;
        speechText += line + '. <break time="700ms"/> ';
    });

    const stopDays = [];
    schedule.dailyDoses.forEach((dose, dayIndex) => {
        if (!dose || dose < 0.01) {
            stopDays.push(dayIndex);
        }
    });

    if (stopDays.length > 0) {
        const stopDayText = formatDayGroups(groupConsecutiveDays(stopDays));
        if (Object.keys(medicationGroups).length === 0) {
            speechText += `หยุดยา ${stopDayText}. <break time="700ms"/> `;
        } else {
            speechText += `และหยุดยา ${stopDayText}. <break time="700ms"/> `;
        }
    }

    return `<speak>${speechText}</speak>`;
}

// Play text using local Web Speech API
export function playTextWithLocalTTS(text, setButtonState) {
    // Remove SSML tags and convert to plain text
    const plainText = text
        .replace(/<speak>/g, '')
        .replace(/<\/speak>/g, '')
        .replace(/<break[^>]*\/>/g, '... ') // Convert breaks to pauses
        .trim();

    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
        alert('ขออภัย เบราว์เซอร์ของคุณไม่รองรับการอ่านออกเสียง');
        return;
    }

    try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(plainText);

        // Set Thai language
        utterance.lang = 'th-TH';
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to find a Thai voice
        const voices = window.speechSynthesis.getVoices();
        const thaiVoice = voices.find(voice =>
            voice.lang.includes('th') || voice.lang.includes('TH')
        );
        if (thaiVoice) {
            utterance.voice = thaiVoice;
        }

        setButtonState('playing');

        utterance.onend = () => {
            setButtonState('idle');
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setButtonState('idle');
        };

        window.speechSynthesis.speak(utterance);

    } catch (error) {
        console.error('Failed to play speech:', error);
        alert('เกิดข้อผิดพลาด: ' + error.message);
        setButtonState('idle');
    }
}

// Generate QR code URL
export function generateQrCodeUrl(option) {
    try {
        const compressedSchedule = {
            d: option.dailyDoses,
            c: option.combos.map(dayCombo =>
                dayCombo.map(pill => ({
                    m: pill.mg,
                    n: pill.count,
                    h: pill.half,
                    q: pill.quarter
                }))
            ),
            t: Date.now() // timestamp for creation date
        };
        const encodedSchedule = encodeURIComponent(JSON.stringify(compressedSchedule));
        return `${PUBLIC_BASE_URL}?schedule=${encodedSchedule}`;
    } catch (e) {
        console.error("QR Code URL generation failed:", e);
        return null;
    }
}
