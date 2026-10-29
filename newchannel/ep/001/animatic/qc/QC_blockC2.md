# QC · blockC2

File: `blockC2_review.mp4` · 75.87 s · 30/1 fps · 16.83 MB · 1.8 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 1280x720 |
| file size <= 30 MB (chat delivery) | **PASS** | 16.83 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.0 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -2.5 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.0 LUFS, TP -2.5 dBTP, LRA 3.2 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 75.8 |
| shots | 25 |
| avg_shot_s | 3.03 |
| longest_shot_s | 12.5 |
| cuts_per_min | 19.0 |
| motion_share | 0.771 |
| still_2s_runs | 3 |
| brightness_mean | 0.42 |
| saturation_mean | 0.431 |
| wpm_overall | 155 |
| wpm_while_speaking | 206 |

```
PASS  cuts_per_min           19.0   target >= 12.0
PASS  avg_shot_s             3.03   target <= 5.0
PASS  longest_shot_s         12.5   target <= 25.0
PASS  motion_share          0.771   target >= 0.5
PASS  still_2s_per_min        2.4   target <= 6.0
PASS  wpm_overall             155   target between (135, 165)

all within the style bible
```

Contact sheet: `contact_sheet_blockC2.jpg` (1 tile every 1 s).
