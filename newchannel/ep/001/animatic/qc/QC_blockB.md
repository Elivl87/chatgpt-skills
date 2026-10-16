# QC · blockB

File: `blockB_draft.mp4` · 53.37 s · 30/1 fps · 7.76 MB · 1.2 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 854x480 |
| file size <= 30 MB (chat delivery) | **PASS** | 7.76 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.0 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -1.4 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.0 LUFS, TP -1.4 dBTP, LRA 3.6 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 53.3 |
| shots | 22 |
| avg_shot_s | 2.42 |
| longest_shot_s | 4.5 |
| cuts_per_min | 23.6 |
| motion_share | 1.0 |
| still_2s_runs | 0 |
| brightness_mean | 0.617 |
| saturation_mean | 0.386 |
| wpm_overall | 139 |
| wpm_while_speaking | 187 |

```
PASS  cuts_per_min           23.6   target >= 12.0
PASS  avg_shot_s             2.42   target <= 5.0
PASS  longest_shot_s          4.5   target <= 25.0
PASS  motion_share            1.0   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
PASS  wpm_overall             139   target between (135, 165)

all within the style bible
```

Contact sheet: `contact_sheet_blockB.jpg` (1 tile every 1 s).
