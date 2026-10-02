# SecondQuest EP001: final production report (V3_CLEAN_BRAM_FINAL)

**Episode:** "Why Do Millions of People Play a Game About Farming?" (M01–M46)
**Rendered:** 2026-10-02, after the Producer's explicit approval of the review sheets
**Branch:** `claude/secondquest-pilot-hook-4yw8xj`

## Deliverable

| Item | Value |
|---|---|
| File | `renders/secondquest_ep001_V3_CLEAN_BRAM_FINAL.mp4` (not in git) |
| SHA-256 | `96d8d87f428b505e12adb1b4ea1f5375ceef54ad1b94b25986ecad0e5a05e36e` |
| Video | H.264, 1920x1080, 30 fps, 8.96 Mb/s |
| Audio | AAC 48 kHz stereo, -14.3 LUFS integrated, -1.6 dBTP (YouTube reference) |
| Duration | 585.28 s (9:45), 17,557 frames, 160 scenes, 208 SFX, music OFF |
| Render time | 2,119 s |

## Gate

- **FINAL_ART_ONLY render gate:** ✔ OK. Every image is FINAL_ART / APPROVED and within safe_zoom, and no art is upscaled on screen.
- **Tests:** 61 passed, 0 failed, 2 skipped.

## Art

**Inventory:**
- **Base package:** 121 / 121 installed (V3 CLEAN, `art_manifest_V3_CLEAN_R1.json`).
- **Supplemental:** 13 / 13.
- **Runtime auxiliary:** 3 EPISODE-tier assets (`ep001.prop.police_car`, `ep001.quest.stuck_in_traffic_car`, `ep001.bg.mini_farm_diorama`).
- **Change log:** all 26 patches and regenerations are logged with parent/output SHA-256 and Higgsfield job IDs in `docs/art_intake/EP001_V3_CLEAN/EP001_V3_CLEAN_RUNTIME_DELTA_v1.json`.

**Provenance types:** `HIGGSFIELD_APPROVED_PACKAGE`, `HIGGSFIELD_JOB_ID`, `DETERMINISTIC_FROM_HIGGSFIELD` (alpha patches, letterbox crop), `OFFICIAL_BRAND_MASTER`.

**Contract change (Producer, 2026-10-02):**
- The channel's maximum output is 1080p.
- The background minimum is `maxOutput × 1.2 = 2304x1296` (it was 3840x2160).
- See `docs/HANDOFF_TO_CREATIVE_PIPELINE_v6_BACKGROUND_SPEC.md`.

## Voice

**Bram**, the official SecondQuest voice:
- Higgsfield `text2speech_v2`, ElevenLabs preset `549ff70a`.
- Hook: approved job `85118f7f`, reused verbatim.
- Blocks B01–B10 match the script 100% on the STT check (`audio/bram/STT_QC.json`).

## Higgsfield credits

| Item | Credits |
|---|---|
| Narration B01–B10 | 24.15 |
| Wordmark (1 failed background-remover attempt + 1 regeneration) | 2.0 |
| Hay roll | 0.5 |
| Producer review batch (bed pair, sitting_back, police car, traffic car) | 5.5 |
| sitting_back_turn, attempt 2 (Quest_v1 face) | 1.0 |
| Mini farm diorama plate | 1.0 |
| **Total** | **34.15** |

The balance went from 155.20 to 121.05.

## Producer review rounds applied

**Round 1:**
- Bed/sleep pair regenerated.
- Fence ending rebuilt as Quest seated looking at the horizon, with the head-turn on the last line.
- Police chase restored with a new police car.
- Traffic car replaced.

**Round 2:**
- **#81 / #82 / #145:** mini farm shown as a full-frame plate, with no boxed card.
- **#99:** dealership headers moved onto the lot.
- **#103:** tractor shown with the 12 m header.
- **#138 / #139:** combine on the riverbank, with no splash shapes.
