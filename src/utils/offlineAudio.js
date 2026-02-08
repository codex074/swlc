// Offline Audio Player for Medication Instructions
// Uses pre-recorded audio files to construct spoken instructions

// Audio file paths mapping
const AUDIO_BASE_PATH = '/audio';

// Audio timing settings
const PAUSE_DELAY_MS = 0; // ไม่มี pause เลย
const PAUSE_MARKER = '__PAUSE__';

// Overlap: เสียงถัดไปจะเริ่มก่อนเสียงปัจจุบันจบ X วินาที
// ค่าลบ = มีช่องว่างระหว่างเสียง
const OVERLAP_SECONDS = -0.01; // -10ms = มี gap 10ms

// Combined pill (mg + color) audio files
// "X มิลลิกรัม สี..."
const PILL_AUDIO = {
    1: `${AUDIO_BASE_PATH}/pills/1mg_white.mp3`,    // 1mg สีขาว
    2: `${AUDIO_BASE_PATH}/pills/2mg_orange.mp3`,   // 2mg สีส้ม
    3: `${AUDIO_BASE_PATH}/pills/3mg_blue.mp3`,     // 3mg สีฟ้า
    4: `${AUDIO_BASE_PATH}/pills/4mg_yellow.mp3`,   // 4mg สีเหลือง
    5: `${AUDIO_BASE_PATH}/pills/5mg_pink.mp3`,     // 5mg สีชมพู
};

// Amount audio files
const AMOUNT_AUDIO = {
    quarter: `${AUDIO_BASE_PATH}/amounts/quarter.mp3`,  // หนึ่งส่วนสี่เม็ด
    half: `${AUDIO_BASE_PATH}/amounts/half.mp3`,        // ครึ่งเม็ด
    1: `${AUDIO_BASE_PATH}/amounts/one.mp3`,            // หนึ่งเม็ด
    2: `${AUDIO_BASE_PATH}/amounts/two.mp3`,            // สองเม็ด
    3: `${AUDIO_BASE_PATH}/amounts/three.mp3`,          // สามเม็ด
};

// Frequency audio files (combined: สัปดาห์ละ X ครั้ง)
const FREQ_AUDIO = {
    everyday: `${AUDIO_BASE_PATH}/frequency/everyday.mp3`,  // ทุกวัน
    1: `${AUDIO_BASE_PATH}/frequency/weekly_1.mp3`,         // สัปดาห์ละ 1 ครั้ง
    2: `${AUDIO_BASE_PATH}/frequency/weekly_2.mp3`,         // สัปดาห์ละ 2 ครั้ง
    3: `${AUDIO_BASE_PATH}/frequency/weekly_3.mp3`,         // สัปดาห์ละ 3 ครั้ง
    4: `${AUDIO_BASE_PATH}/frequency/weekly_4.mp3`,         // สัปดาห์ละ 4 ครั้ง
    5: `${AUDIO_BASE_PATH}/frequency/weekly_5.mp3`,         // สัปดาห์ละ 5 ครั้ง
    6: `${AUDIO_BASE_PATH}/frequency/weekly_6.mp3`,         // สัปดาห์ละ 6 ครั้ง
};

// Day audio files
const DAY_AUDIO = {
    0: `${AUDIO_BASE_PATH}/days/sunday.mp3`,
    1: `${AUDIO_BASE_PATH}/days/monday.mp3`,
    2: `${AUDIO_BASE_PATH}/days/tuesday.mp3`,
    3: `${AUDIO_BASE_PATH}/days/wednesday.mp3`,
    4: `${AUDIO_BASE_PATH}/days/thursday.mp3`,
    5: `${AUDIO_BASE_PATH}/days/friday.mp3`,
    6: `${AUDIO_BASE_PATH}/days/saturday.mp3`,
};

// Phrase audio files
const PHRASE_AUDIO = {
    medicine: `${AUDIO_BASE_PATH}/phrases/medicine.mp3`, // ยาขนาด
    take: `${AUDIO_BASE_PATH}/phrases/take.mp3`,    // กิน
    only: `${AUDIO_BASE_PATH}/phrases/only.mp3`,    // เฉพาะ
    stop: `${AUDIO_BASE_PATH}/phrases/stop.mp3`,    // หยุดยา
    and: `${AUDIO_BASE_PATH}/phrases/and.mp3`,      // และ
};

// Audio queue player
let isPlaying = false;
let audioContext = null;
let scheduledSources = [];

// Preload audio as AudioBuffer (Web Audio API)
const audioBufferCache = new Map();

// Trim silence from the end of audio buffer
function trimSilenceFromEnd(audioBuffer, threshold = 0.01) {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Find the last sample that exceeds the threshold
    let endSample = channelData.length - 1;
    for (let i = channelData.length - 1; i >= 0; i--) {
        if (Math.abs(channelData[i]) > threshold) {
            // Add a small buffer (50ms worth of samples)
            endSample = Math.min(i + Math.floor(sampleRate * 0.05), channelData.length - 1);
            break;
        }
    }

    // Also trim from beginning
    let startSample = 0;
    for (let i = 0; i < channelData.length; i++) {
        if (Math.abs(channelData[i]) > threshold) {
            // Add a tiny buffer at start (10ms)
            startSample = Math.max(0, i - Math.floor(sampleRate * 0.01));
            break;
        }
    }

    // Calculate trimmed duration
    const trimmedLength = endSample - startSample + 1;

    // Create new buffer with trimmed audio
    const trimmedBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        trimmedLength,
        sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const sourceData = audioBuffer.getChannelData(channel);
        const destData = trimmedBuffer.getChannelData(channel);
        for (let i = 0; i < trimmedLength; i++) {
            destData[i] = sourceData[startSample + i];
        }
    }

    return trimmedBuffer;
}

async function preloadAudioBuffer(url) {
    if (audioBufferCache.has(url)) {
        return audioBufferCache.get(url);
    }

    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Failed to fetch audio: ${url}`);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Trim silence from the buffer
        const trimmedBuffer = trimSilenceFromEnd(audioBuffer);
        audioBufferCache.set(url, trimmedBuffer);
        return trimmedBuffer;
    } catch (error) {
        console.warn(`Failed to load audio: ${url}`, error);
        return null;
    }
}

async function playAudioSequence(items, setButtonState) {
    if (isPlaying) {
        stopAudio();
        return;
    }

    setButtonState('loading');

    // Initialize AudioContext
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Resume AudioContext if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    // Preload all audio files (skip pause markers)
    const audioUrls = items.filter(item => item !== PAUSE_MARKER);
    const audioPromises = audioUrls.map(url => preloadAudioBuffer(url));
    const audioBuffers = await Promise.all(audioPromises);

    // Create a map for loaded audio buffers
    const bufferMap = new Map();
    audioUrls.forEach((url, index) => {
        if (audioBuffers[index]) {
            bufferMap.set(url, audioBuffers[index]);
        }
    });

    if (bufferMap.size === 0) {
        setButtonState('idle');
        alert('ไม่พบไฟล์เสียง กรุณาตรวจสอบว่ามีไฟล์เสียงในโฟลเดอร์ /public/audio/');
        return;
    }

    setButtonState('playing');
    isPlaying = true;
    scheduledSources = [];

    // Schedule all audio to play seamlessly
    let currentTime = audioContext.currentTime + 0.05; // Small delay to start
    let totalDuration = 0;

    for (const item of items) {
        if (!isPlaying) break;

        if (item === PAUSE_MARKER) {
            // Add minimal pause between groups (or no pause)
            currentTime += PAUSE_DELAY_MS / 1000;
        } else if (bufferMap.has(item)) {
            const buffer = bufferMap.get(item);
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);

            // Schedule to play at exact time
            source.start(currentTime);
            scheduledSources.push(source);

            // Move time pointer forward (with overlap to remove gaps)
            // เสียงถัดไปจะเริ่มก่อนเสียงปัจจุบันจบ OVERLAP_SECONDS วินาที
            currentTime += Math.max(0.05, buffer.duration - OVERLAP_SECONDS);
            totalDuration = currentTime - audioContext.currentTime;
        }
    }

    // Wait for all audio to finish
    await new Promise(resolve => {
        setTimeout(() => {
            isPlaying = false;
            scheduledSources = [];
            setButtonState('idle');
            resolve();
        }, totalDuration * 1000 + 100);
    });
}

function stopAudio() {
    isPlaying = false;
    // Stop all scheduled sources
    scheduledSources.forEach(source => {
        try {
            source.stop();
        } catch (e) {
            // Ignore errors if already stopped
        }
    });
    scheduledSources = [];
}

// Generate audio URL sequence from medication schedule
export function generateAudioSequence(schedule) {
    const urls = [];
    const medicationGroups = {};

    // Group medications by pill type and days
    (schedule.combos || []).forEach((combo, dayIndex) => {
        if (schedule.dailyDoses[dayIndex] && schedule.dailyDoses[dayIndex] > 0.01) {
            (combo || []).forEach(pill => {
                const key = `${pill.mg}-${pill.half}-${pill.quarter}-${pill.count}`;
                if (!medicationGroups[key]) {
                    medicationGroups[key] = { ...pill, days: [] };
                }
                medicationGroups[key].days.push(dayIndex);
            });
        }
    });

    // Build audio sequence for each medication group
    Object.values(medicationGroups)
        .sort((a, b) => b.mg - a.mg)
        .forEach((instr, index) => {
            const { mg, half, quarter, count, days } = instr;

            if (index > 0) {
                urls.push(PAUSE_MARKER);
                urls.push(PAUSE_MARKER); // ช่วงพักยาวระหว่างยาแต่ละตัว
            }

            // กลุ่ม 1: "ยาขนาด X มิลลิกรัม สี..."
            urls.push(PHRASE_AUDIO.medicine);
            urls.push(PILL_AUDIO[mg]);

            urls.push(PAUSE_MARKER);

            // กลุ่ม 2: "กิน"
            urls.push(PHRASE_AUDIO.take);

            urls.push(PAUSE_MARKER);

            // กลุ่ม 3: "X เม็ด"
            if (quarter) {
                urls.push(AMOUNT_AUDIO.quarter);
            } else if (half) {
                urls.push(AMOUNT_AUDIO.half);
            } else {
                urls.push(AMOUNT_AUDIO[count] || AMOUNT_AUDIO[1]);
            }

            urls.push(PAUSE_MARKER);

            // กลุ่ม 4: Frequency
            const freq = days.length;
            if (freq === 7) {
                // "ทุกวัน"
                urls.push(FREQ_AUDIO.everyday);
            } else {
                // "สัปดาห์ละ X ครั้ง"
                urls.push(FREQ_AUDIO[freq] || FREQ_AUDIO[1]);

                urls.push(PAUSE_MARKER);

                // กลุ่ม 5: "เฉพาะ"
                urls.push(PHRASE_AUDIO.only);

                urls.push(PAUSE_MARKER);

                // กลุ่ม 6: "วันจันทร์ วันอังคาร... และวันอาทิตย์"
                // เรียงลำดับวันให้เริ่มจากจันทร์ (1,2,3,4,5,6,0)
                const sortedDays = [...days].sort((a, b) => {
                    // แปลง 0 (อาทิตย์) เป็น 7 เพื่อให้เรียงท้ายสุด
                    const aOrder = a === 0 ? 7 : a;
                    const bOrder = b === 0 ? 7 : b;
                    return aOrder - bOrder;
                });

                sortedDays.forEach((dayIndex, i) => {
                    // เพิ่ม "และ" ก่อนวันสุดท้าย (ถ้ามีมากกว่า 1 วัน)
                    if (i === sortedDays.length - 1 && sortedDays.length > 1) {
                        urls.push(PHRASE_AUDIO.and);
                    }
                    urls.push(DAY_AUDIO[dayIndex]);
                });
            }

            urls.push(PAUSE_MARKER);
        });

    // Check for stop days
    const stopDays = [];
    schedule.dailyDoses.forEach((dose, dayIndex) => {
        if (!dose || dose < 0.01) {
            stopDays.push(dayIndex);
        }
    });

    if (stopDays.length > 0 && stopDays.length < 7) {
        if (Object.keys(medicationGroups).length > 0) {
            urls.push(PHRASE_AUDIO.and);
        }
        urls.push(PHRASE_AUDIO.stop);
        stopDays.forEach(dayIndex => {
            urls.push(DAY_AUDIO[dayIndex]);
        });
    }

    return urls;
}

// Main function to play medication instructions
export function playMedicationAudio(schedule, setButtonState) {
    const audioUrls = generateAudioSequence(schedule);
    playAudioSequence(audioUrls, setButtonState);
}

// Stop currently playing audio
export { stopAudio };
