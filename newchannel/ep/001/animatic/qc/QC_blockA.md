# QC · blockA

File: `blockA_draft.mp4` · 42.03 s · 30/1 fps · 5.35 MB · 1.0 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 854x480 |
| file size <= 30 MB (chat delivery) | **PASS** | 5.35 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.1 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -1.5 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | declared only: [(40.9602, 42.0267)] |

Loudness (ffmpeg ebur128 on the final mp4): I -14.1 LUFS, TP -1.5 dBTP, LRA 3.6 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 42.0 |
| shots | 22 |
| avg_shot_s | 1.91 |
| longest_shot_s | 3.84 |
| cuts_per_min | 30.0 |
| motion_share | 0.888 |
| still_2s_runs | 0 |
| brightness_mean | 0.605 |
| saturation_mean | 0.364 |
| wpm_overall | 111 |
| wpm_while_speaking | 207 |

```
PASS  cuts_per_min           30.0   target >= 12.0
PASS  avg_shot_s             1.91   target <= 5.0
PASS  longest_shot_s         3.84   target <= 25.0
PASS  motion_share          0.888   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
FLAG  wpm_overall             111   target between (135, 165)

1 flag(s): see docs/style/STYLE_BIBLE.md for what to change
```

Contact sheet: `contact_sheet_blockA.jpg` (1 tile every 1 s).
