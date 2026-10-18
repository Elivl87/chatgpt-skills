# QC · blockD2

File: `blockD2_draft.mp4` · 75.73 s · 30/1 fps · 9.86 MB · 1.0 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 854x480 |
| file size <= 30 MB (chat delivery) | **PASS** | 9.86 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.1 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -1.2 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.1 LUFS, TP -1.2 dBTP, LRA 9.0 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 75.7 |
| shots | 34 |
| avg_shot_s | 2.23 |
| longest_shot_s | 5.17 |
| cuts_per_min | 26.2 |
| motion_share | 0.996 |
| still_2s_runs | 0 |
| brightness_mean | 0.614 |
| saturation_mean | 0.288 |
| wpm_overall | 138 |
| wpm_while_speaking | 187 |

```
PASS  cuts_per_min           26.2   target >= 12.0
PASS  avg_shot_s             2.23   target <= 5.0
PASS  longest_shot_s         5.17   target <= 25.0
PASS  motion_share          0.996   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
PASS  wpm_overall             138   target between (135, 165)

all within the style bible
```

Contact sheet: `contact_sheet_blockD2.jpg` (1 tile every 1 s).
