# QC · blockC1

File: `blockC1_draft.mp4` · 43.20 s · 30/1 fps · 3.51 MB · 0.6 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 854x480 |
| file size <= 30 MB (chat delivery) | **PASS** | 3.51 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.0 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -1.4 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.0 LUFS, TP -1.4 dBTP, LRA 1.9 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 43.2 |
| shots | 11 |
| avg_shot_s | 3.92 |
| longest_shot_s | 8.17 |
| cuts_per_min | 13.9 |
| motion_share | 0.872 |
| still_2s_runs | 0 |
| brightness_mean | 0.73 |
| saturation_mean | 0.13 |
| wpm_overall | 149 |
| wpm_while_speaking | 192 |

```
PASS  cuts_per_min           13.9   target >= 12.0
PASS  avg_shot_s             3.92   target <= 5.0
PASS  longest_shot_s         8.17   target <= 25.0
PASS  motion_share          0.872   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
PASS  wpm_overall             149   target between (135, 165)

all within the style bible
```

Contact sheet: `contact_sheet_blockC1.jpg` (1 tile every 1 s).
