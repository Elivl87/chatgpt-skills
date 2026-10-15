# QC · blockC2

File: `blockC2_draft.mp4` · 84.00 s · 30/1 fps · 11.34 MB · 1.1 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 854x480 |
| file size <= 30 MB (chat delivery) | **PASS** | 11.34 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.1 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -1.3 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.1 LUFS, TP -1.3 dBTP, LRA 2.2 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 84.0 |
| shots | 25 |
| avg_shot_s | 3.36 |
| longest_shot_s | 13.67 |
| cuts_per_min | 17.1 |
| motion_share | 0.742 |
| still_2s_runs | 5 |
| brightness_mean | 0.403 |
| saturation_mean | 0.45 |
| wpm_overall | 149 |
| wpm_while_speaking | 201 |

```
PASS  cuts_per_min           17.1   target >= 12.0
PASS  avg_shot_s             3.36   target <= 5.0
PASS  longest_shot_s        13.67   target <= 25.0
PASS  motion_share          0.742   target >= 0.5
PASS  still_2s_per_min        3.6   target <= 6.0
PASS  wpm_overall             149   target between (135, 165)

all within the style bible
```

Contact sheet: `contact_sheet_blockC2.jpg` (1 tile every 1 s).
