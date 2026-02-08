# Audio Files for Offline TTS

This folder contains pre-recorded audio files for the medication instruction reader.

## Folder Structure

```
audio/
├── pills/              # ขนาดยาและสียา
│   ├── mg_1.mp3        # "หนึ่งมิลลิกรัม"
│   ├── mg_2.mp3        # "สองมิลลิกรัม"
│   ├── mg_3.mp3        # "สามมิลลิกรัม"
│   ├── mg_4.mp3        # "สี่มิลลิกรัม"
│   ├── mg_5.mp3        # "ห้ามิลลิกรัม"
│   ├── color_white.mp3   # "สีขาว"
│   ├── color_orange.mp3  # "สีส้ม"
│   ├── color_blue.mp3    # "สีฟ้า"
│   ├── color_yellow.mp3  # "สีเหลือง"
│   └── color_pink.mp3    # "สีชมพู"
│
├── amounts/            # จำนวนเม็ด
│   ├── quarter.mp3     # "หนึ่งส่วนสี่เม็ด"
│   ├── half.mp3        # "ครึ่งเม็ด"
│   ├── one.mp3         # "หนึ่งเม็ด"
│   ├── two.mp3         # "สองเม็ด"
│   └── three.mp3       # "สามเม็ด"
│
├── days/               # วัน
│   ├── sunday.mp3      # "วันอาทิตย์"
│   ├── monday.mp3      # "วันจันทร์"
│   ├── tuesday.mp3     # "วันอังคาร"
│   ├── wednesday.mp3   # "วันพุธ"
│   ├── thursday.mp3    # "วันพฤหัสบดี"
│   ├── friday.mp3      # "วันศุกร์"
│   └── saturday.mp3    # "วันเสาร์"
│
├── phrases/            # วลีต่างๆ
│   ├── medicine.mp3    # "ยาขนาด"
│   ├── take.mp3        # "กิน"
│   ├── everyday.mp3    # "ทุกวัน"
│   ├── weekly.mp3      # "สัปดาห์ละ"
│   ├── times.mp3       # "ครั้ง"
│   ├── only.mp3        # "เฉพาะ"
│   ├── stop.mp3        # "หยุดยา"
│   ├── and.mp3         # "และ"
│   └── pause.mp3       # (เงียบ 0.5 วินาที)
│
└── frequency/          # ความถี่
    ├── one_time.mp3    # "หนึ่งครั้ง"
    ├── two_times.mp3   # "สองครั้ง"
    ├── three_times.mp3 # "สามครั้ง"
    ├── four_times.mp3  # "สี่ครั้ง"
    ├── five_times.mp3  # "ห้าครั้ง"
    └── six_times.mp3   # "หกครั้ง"
```

## How to Create Audio Files

### Option 1: Record Yourself
Use a voice recorder app to record each phrase in Thai.

### Option 2: Use TTS Service
Use Google TTS, Amazon Polly, or other TTS services to generate MP3 files.

### Tips
- Keep all files short (< 2 seconds each)
- Use consistent volume levels
- Use MP3 format at 128kbps or higher
- Add a small silence at the end of each clip (100-200ms)
